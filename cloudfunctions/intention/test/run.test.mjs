/**
 * intention 云函数本地测试（无 node_modules，内存 mock wx-server-sdk）
 * 运行：node cloudfunctions/intention/test/run.test.mjs
 *
 * 通过 Module._load 拦截 require('wx-server-sdk')，注入内存 Map 存储的 mock 后再加载 ../index.js。
 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const Module = require('node:module');

// ---------- 断言小工具 ----------
let passed = 0;
let failed = 0;
function check(cond, label, detail) {
  if (cond) {
    passed++;
    console.log(`  ✅ PASS  ${label}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL  ${label}${detail ? '  -> ' + detail : ''}`);
  }
}
function eq(actual, expected, label) {
  check(actual === expected, label, `expected=${JSON.stringify(expected)} actual=${JSON.stringify(actual)}`);
}

// ---------- 构造 wx-server-sdk mock ----------
const OPENID = 'openid_test_user_001';
const store = new Map(); // _id -> doc
let nextId = 1;

function matchWhere(doc, where) {
  if (!where) return true;
  return Object.keys(where).every((k) => doc[k] === where[k]);
}

function makeQuery(coll, where) {
  const q = {
    _coll: coll,
    _where: where || {},
    _orderField: null,
    _orderDir: 'asc',
    _limitN: null,
    where(w) {
      return makeQuery(coll, Object.assign({}, this._where, w));
    },
    orderBy(field, dir) {
      this._orderField = field;
      this._orderDir = dir || 'asc';
      return this;
    },
    limit(n) {
      this._limitN = n;
      return this;
    },
    _collect() {
      let rows = [...store.values()].filter(
        (d) => d.__coll === this._coll && matchWhere(d, this._where),
      );
      if (this._orderField) {
        const f = this._orderField;
        rows = rows.slice().sort((a, b) => {
          const av = a[f] == null ? -Infinity : a[f];
          const bv = b[f] == null ? -Infinity : b[f];
          return this._orderDir === 'desc' ? bv - av : av - bv;
        });
      }
      if (this._limitN != null) rows = rows.slice(0, this._limitN);
      return rows;
    },
    async get() {
      return {
        data: this._collect().map((d) => {
          const { __coll, ...rest } = d;
          return rest;
        }),
      };
    },
    async count() {
      return { total: this._collect().length };
    },
  };
  return q;
}

const db = {
  collection(name) {
    return {
      where(w) {
        return makeQuery(name, w);
      },
      async add({ data }) {
        const id = 'auto_' + nextId++;
        const doc = Object.assign({}, data, { _id: id, __coll: name });
        // serverDate 占位 -> 落库时解析为真实时间戳
        if (doc.createdAt && typeof doc.createdAt === 'object' && doc.createdAt.__serverDate) {
          doc.createdAt = Date.now();
        }
        store.set(id, doc);
        return { _id: id };
      },
    };
  },
  serverDate() {
    return { __serverDate: true };
  },
};

const mockCloud = {
  DYNAMIC_CURRENT_ENV: 'local-mock-env',
  init() {},
  database() {
    return db;
  },
  getWXContext() {
    return { OPENID };
  },
};

// ---------- 拦截 require('wx-server-sdk') 并加载 index.js ----------
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === 'wx-server-sdk') return mockCloud;
  return originalLoad.apply(this, arguments);
};

const here = dirname(fileURLToPath(import.meta.url));
const { main } = require(join(here, '..', 'index.js'));

// ---------- 用例 ----------
console.log('\n[用例①] 合法 create：两件商品含 qty');
const r1 = await main({
  action: 'create',
  items: [
    { id: 'g-a', qty: 2 },
    { id: 'g-b', qty: 1 },
  ],
  name: ' 小明 ',
  phone: '13812345678',
  remark: '请电话联系',
});
eq(r1.success, true, '① create success=true');
check(typeof r1.id === 'string' && r1.id.length > 0, '① 返回 id');
check(Array.isArray(r1.ids) && r1.ids.length === 1 && r1.ids[0] === r1.id, '① ids 长度=1 且指向同一文档');
eq(r1.count, 3, '① goodsCount=2+1=3');
// 库中该 openid 恰好 1 条
const afterCreate = [...store.values()].filter((d) => d.__coll === 'intentions' && d.openid === OPENID);
eq(afterCreate.length, 1, '① 库中新增恰好 1 条聚合文档');
eq(afterCreate[0].goodsCount, 3, '① 文档 goodsCount=3');
eq(afterCreate[0].name, '小明', '① 入库 name 已 trim');
eq(afterCreate[0].notified, false, '① notified=false');
eq(afterCreate[0].openid, OPENID, '① openid 已写入');

console.log('\n[用例②] 缺 name');
const r2 = await main({ action: 'create', items: [{ id: 'g-a' }], name: '   ', phone: '13812345678' });
eq(r2.success, false, '② success=false');
eq(r2.code, 'MISSING_NAME', '② code=MISSING_NAME');

console.log('\n[用例③] 非法手机号 + 缺手机号');
const r3 = await main({ action: 'create', items: [{ id: 'g-a' }], name: '小红', phone: '12345678901' });
eq(r3.success, false, '③ 错号 success=false');
eq(r3.code, 'INVALID_PHONE', '③ code=INVALID_PHONE');
const r4 = await main({ action: 'create', items: [{ id: 'g-a' }], name: '小红' });
eq(r4.success, false, '③ 缺号 success=false');
eq(r4.code, 'MISSING_PHONE', '③ code=MISSING_PHONE');

console.log('\n[用例④] query 能查到①写入的记录');
const r5 = await main({ action: 'query' });
eq(r5.success, true, '④ query success=true');
eq(Array.isArray(r5.list), true, '④ list 为数组');
eq(r5.total, afterCreate.length, '④ total 与库中条数一致');
const found = (r5.list || []).find((x) => x._id === r1.id);
check(!!found, '④ 列表包含用例①写入的记录');
if (found) {
  eq(found.goodsCount, 3, '④ 记录 goodsCount 正确');
  eq(found.phone, '13812345678', '④ 记录 phone 正确');
  eq(found.items.length, 2, '④ 记录含两件商品');
}

console.log('\n[用例⑤] 空 items -> MISSING_GOODS');
const r6 = await main({ action: 'create', items: [], name: '小明', phone: '13812345678' });
eq(r6.success, false, '⑤ success=false');
eq(r6.code, 'MISSING_GOODS', '⑤ code=MISSING_GOODS');

console.log('\n[附加] goodsIds 兼容兜底');
const r7 = await main({ action: 'create', goodsIds: ['g-c', 'g-d'], name: '小刚', phone: '13911112222' });
eq(r7.success, true, '附加 goodsIds success=true');
eq(r7.count, 2, '附加 goodsIds 两件各 qty=1 -> count=2');

// ---------- 汇总 ----------
console.log('\n========================================');
console.log(`用例通过 ${passed}，失败 ${failed}`);
if (failed === 0) {
  console.log('✅ 云函数测试全部通过');
} else {
  console.error('❌ 存在失败用例');
  process.exit(1);
}
