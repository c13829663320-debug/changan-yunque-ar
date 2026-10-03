interface Particle {
  i: number;
  left: number;
  delay: number;
  dur: number;
}

let timer: ReturnType<typeof setTimeout> | null = null;

Page({
  data: {
    particles: [] as Particle[],
  },

  onLoad() {
    const particles: Particle[] = Array.from({ length: 18 }, (_, i) => ({
      i,
      left: Math.round(Math.random() * 100),
      delay: +(Math.random() * 3).toFixed(2),
      dur: +(5 + Math.random() * 5).toFixed(2),
    }));
    this.setData({ particles });
    timer = setTimeout(() => this.goHome(), 2500);
  },

  goHome() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    wx.switchTab({ url: '/pages/home/home' });
  },

  onSkip() {
    this.goHome();
  },

  onUnload() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  },
});
