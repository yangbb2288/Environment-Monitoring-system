var __renderjsModules={};

__renderjsModules.a0894414 = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // <stdin>
  var stdin_exports = {};
  __export(stdin_exports, {
    renderModule: () => renderModule
  });
  var renderModule = {
    data() {
      return {
        chart: null,
        resizeObserver: null,
        initAttempts: 0,
        maxAttempts: 10
      };
    },
    mounted() {
      uni.$on("updateEChart-" + this.props.chartId, (data) => {
        this.initChart(data);
      });
      uni.$on("disposeEChart-" + this.props.chartId, () => {
        this.disposeChart();
        uni.$off("updateEChart-" + this.props.chartId);
        uni.$off("disposeEChart-" + this.props.chartId);
      });
    },
    methods: {
      // 初始化或更新图表
      initChart(data) {
        console.log("Renderjs: \u521D\u59CB\u5316\u56FE\u8868", this.props.chartId, "\u6570\u636E:", JSON.stringify(data).substring(0, 100) + "...");
        try {
          if (!window.echarts) {
            console.error("Renderjs: ECharts\u5E93\u4E0D\u53EF\u7528");
            if (this.initAttempts < this.maxAttempts) {
              this.initAttempts++;
              setTimeout(() => {
                this.initChart(data);
              }, 500 * this.initAttempts);
            } else {
              uni.$emit("chartError-" + this.props.chartId, { message: "ECharts\u5E93\u4E0D\u53EF\u7528" });
            }
            return;
          }
          const dom = document.getElementById(this.props.chartId);
          console.log("Renderjs: \u67E5\u627EDOM\u5143\u7D20", this.props.chartId, dom ? "\u627E\u5230" : "\u672A\u627E\u5230");
          if (!dom) {
            console.error("Renderjs: \u627E\u4E0D\u5230\u56FE\u8868DOM\u5143\u7D20", this.props.chartId);
            if (this.initAttempts < this.maxAttempts) {
              this.initAttempts++;
              setTimeout(() => {
                this.initChart(data);
              }, 500 * this.initAttempts);
            } else {
              uni.$emit("chartError-" + this.props.chartId, { message: "\u627E\u4E0D\u5230\u56FE\u8868DOM\u5143\u7D20" });
            }
            return;
          }
          const width = dom.clientWidth;
          const height = dom.clientHeight;
          if (width === 0 || height === 0) {
            console.warn("Renderjs: DOM\u5C3A\u5BF8\u4E3A0, \u5EF6\u8FDF\u6E32\u67D3");
            if (this.initAttempts < this.maxAttempts) {
              this.initAttempts++;
              setTimeout(() => {
                this.initChart(data);
              }, 500 * this.initAttempts);
            } else {
              uni.$emit("chartError-" + this.props.chartId, { message: "DOM\u5C3A\u5BF8\u4E3A0" });
            }
            return;
          }
          if (this.chart) {
            console.log("Renderjs: \u66F4\u65B0\u5DF2\u6709\u56FE\u8868");
            this.chart.setOption(data.option, true);
            this.chart.resize();
          } else {
            console.log("Renderjs: \u521B\u5EFA\u65B0\u56FE\u8868");
            this.chart = window.echarts.init(dom, null, {
              renderer: "canvas",
              useDirtyRect: false
            });
            this.chart.setOption(data.option, true);
            this.chart.on("click", (params) => {
              uni.$emit("chartClick-" + this.props.chartId, params);
            });
            if (data.autoResize) {
              this.setupResize();
            }
            uni.$emit("chartReady-" + this.props.chartId);
          }
        } catch (error) {
          console.error("Renderjs: \u56FE\u8868\u521D\u59CB\u5316\u5931\u8D25", error);
          uni.$emit("chartError-" + this.props.chartId, error);
        }
      },
      // 设置自适应
      setupResize() {
        if (window.ResizeObserver && !this.resizeObserver) {
          const dom = document.getElementById(this.props.chartId);
          this.resizeObserver = new ResizeObserver(() => {
            if (this.chart) {
              this.chart.resize();
            }
          });
          this.resizeObserver.observe(dom);
        }
        window.addEventListener("resize", this.handleResize);
      },
      // 处理窗口大小变化
      handleResize() {
        if (this.chart) {
          this.chart.resize();
        }
      },
      // 销毁图表
      disposeChart() {
        window.removeEventListener("resize", this.handleResize);
        if (this.resizeObserver) {
          this.resizeObserver.disconnect();
          this.resizeObserver = null;
        }
        if (this.chart) {
          this.chart.dispose();
          this.chart = null;
        }
      }
    },
    beforeDestroy() {
      this.disposeChart();
    }
  };
  return __toCommonJS(stdin_exports);
})();
