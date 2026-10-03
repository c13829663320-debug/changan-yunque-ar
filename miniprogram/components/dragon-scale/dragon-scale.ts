Component({
  properties: {
    /** 是否已集齐 */
    got: { type: Boolean, value: false },
    /** lg=龙鳞墙 / md / sm=tour横排 */
    size: { type: String, value: 'lg' },
    /** 珐琅色：celadon/azurite/cinnabar/jade/ivory */
    enamel: { type: String, value: 'celadon' },
    name: { type: String, value: '' },
    hall: { type: String, value: '' },
    /** 是否在鳞下显示名称/殿名 */
    showLabel: { type: Boolean, value: false }
  }
});
