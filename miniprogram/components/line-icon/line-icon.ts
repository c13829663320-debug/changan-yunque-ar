Component({
  properties: {
    /** 图标名：lock/scale/stamp/relic/intention/booking/source/wish/about/arrow */
    name: { type: String, value: '' },
    /** 尺寸 rpx */
    size: { type: Number, value: 40 },
    /** gold=暗金；light=月白（用于朱砂底） */
    theme: { type: String, value: 'gold' }
  }
});
