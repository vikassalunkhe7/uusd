"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Number.prototype.stmFormatMoney = function (c, d, t) {
    var n = this,
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

(function ($) {
    var StmCryptoCharts = function () {
        function StmCryptoCharts(el) {
            var _this2 = this;

            _classCallCheck(this, StmCryptoCharts);

            var that = this;
            this.el = el;
            this.chartContainer = $(el);
            this.options = this.chartContainer.data();
            this.colors = this.options.colors;
            this.currencies = this.options.currencies;
            this.currency = this.currencies[Object.keys(this.currencies)[0]];
            this.cacheExp = this.options['cache-expiration'];
            this.decimals = this.options.decimals;
            this.contrast = this.options.contrast;
            this.periods = this.chartContainer.find('.stm_crypto_chart__periods').find('span');
            this.period = this.periods.filter('.active').data('period');
            this.preloader = this.chartContainer.find('.stm_crypto_chart__preloader');
            this.error = this.chartContainer.find('.stm_crypto_chart__error');
            this.retryButton = this.error.find('button');
            this.loadingState = false;
            this.xAxesStepSizes = {
                '1 day': 2,
                '1 week': 1,
                '1 month': 3,
                '1 year': 40,
                'all': 80
            };
            this.priceData = null;
            this.xAxesTimeUnit = 'day';
            this.chart = null;
            this.labels = [];
            this.chartConfig = {
                type: 'lineWithLine',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'USD/' + this.currency,
                        data: [],
                        pointRadius: 0,
                        backgroundColor: this.colors.usd.fill,
                        borderColor: this.colors.usd.border,
                        yAxisID: "y-axis-1",
                        pointBackgroundColor: this.colors.usd.fill
                    }, {
                        label: 'BTC/' + this.currency,
                        data: [],
                        pointRadius: 0,
                        backgroundColor: this.colors.btc.fill,
                        borderColor: this.colors.btc.border,
                        yAxisID: "y-axis-2",
                        pointBackgroundColor: this.colors.btc.fill
                    }]
                },
                options: {
                    tooltips: {
                        mode: 'index',
                        intersect: false,
                        position: 'mouse',
                        callbacks: {
                            label: function label(tooltipItem, data) {
                                if (tooltipItem.datasetIndex === 0) {
                                    return " Price (USD): " + tooltipItem.yLabel.toFixed(that.decimals.usd);
                                } else {
                                    return " Price (BTC): " + tooltipItem.yLabel.toFixed(that.decimals.btc);
                                }
                            },
                            labelColor: function labelColor(tooltipItem, chart) {
                                return {
                                    borderColor: chart.config.data.datasets[tooltipItem.datasetIndex].borderColor,
                                    backgroundColor: chart.config.data.datasets[tooltipItem.datasetIndex].borderColor
                                };
                            },
                            footer: function footer(tooltipItems, data) {
                                var marketCapData = that.priceData.market_cap_by_available_supply[tooltipItems[0].index][1];
                                return ["Market Cap: " + marketCapData.stmFormatMoney(0) + " USD"];
                            }
                        },
                        backgroundColor: "rgba(255,255,255,1)",
                        titleFontColor: '#000',
                        titleMarginBottom: 15,
                        bodyFontColor: '#000',
                        bodySpacing: 5,
                        footerFontColor: '#000',
                        borderColor: '#000',
                        borderWidth: 1,
                        xPadding: 15,
                        yPadding: 15,
                        footerMarginTop: 10,
                        cornerRadius: 0

                    },
                    scales: {
                        xAxes: [{
                            type: 'time',
                            time: {
                                tooltipFormat: 'DD/MM/YYYY, HH:mm',
                                unit: this.xAxesTimeUnit,
                                displayFormats: {
                                    'hour': 'HH:mm',
                                    'day': 'DD. MMM',
                                    'month': 'HH:mm'
                                }
                            },
                            gridLines: {
                                display: false
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                callback: function callback(value, index, values) {
                                    return '$ ' + value.toFixed(that.decimals.usd);
                                }
                            },
                            id: "y-axis-1",
                            position: 'left',
                            gridLines: {
                                color: this.contrast ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                            }
                        }]
                    },
                    legend: {
                        // display: false,
                        fontColor: this.contrast ? '#ffffff' : '#666',
                        onClick: function onClick(e, legendItem) {
                            var index = legendItem.datasetIndex;
                            var ci = _this2.chart;
                            var meta = ci.getDatasetMeta(index);
                            meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;

                            ci.data.datasets[index].hidden = !ci.data.datasets[index].hidden;
                            //toggle the related labels' visibility
                            ci.options.scales.yAxes[index].display = !ci.options.scales.yAxes[index].display;
                            ci.update();
                        },
                        labels: {
                            filter: function filter(legendItem, chartData) {
                                var legendText = legendItem.text;
                                if (legendText !== undefined) {
                                    if (_this2.currency === 'BTC') {
                                        return !legendText.includes('BTC/');
                                    }
                                } else {
                                    return false;
                                }

                                return true;
                            }
                        }
                    }
                }
            };
            this.graph = null;
            this.now = moment();

            this.rangeButtonsContainerClassname = 'stm-crypto-charts-ranges';
            this.buttons = {
                '1d': [moment(this.now).subtract(1, 'days'), this.now],
                '1w': [moment(this.now).subtract(7, 'days'), this.now]
            };

            this.init();

        }

        _createClass(StmCryptoCharts, [{
            key: "init",
            value: function init() {
                var that = this;
                if (this.currency !== 'BTC') {
                    this.chartConfig.options.scales.yAxes[1] = {
                        ticks: {
                            callback: function callback(value, index, values) {
                                return value.toFixed(that.decimals.btc) + ' BTC';
                            }
                        },
                        id: "y-axis-2",
                        position: 'right',
                        gridLines: {
                            display: false,
                            gridLines: {
                                color: this.contrast ? '#ffffff' : 'rgba(0, 0, 0, 0.1)'
                            }
                        }
                    };
                }
                this.registerEvents();
                this.extend();
                this.getTimeUnit();
                this.drawChart();
                this.getCurrencyData(this.updateChart);
            }
        }, {
            key: "registerEvents",
            value: function registerEvents() {
                var that = this;
                this.chartContainer.find('.stm_crypto_chart__currency').change(function (e) {
                    var val = $(this).val();
                    that.currencies.forEach(function (v, k) {
                        if (v === val) {
                            that.currency = v;
                        }
                    });
                    that.getCurrencyData(that.updateChart);
                });

                this.periods.on('click', function () {
                    var clickedPeriod = this;
                    that.period = $(this).data('period');
                    that.getTimeUnit();
                    that.periods.each(function () {
                        $(this).addClass('active').not($(clickedPeriod)).removeClass('active');
                    });
                    if (navigator.onLine) {
                        that.getCurrencyData(that.updateChart);
                    } else {
                        that.showError();
                    }
                    that.updateXAxesStepSizes();
                });
                this.retryButton.on('click', function () {
                    if (navigator.onLine) {
                        that.hideError();
                        that.getCurrencyData(that.updateChart);
                    }
                });
            }
        }, {
            key: "updateXAxesStepSizes",
            value: function updateXAxesStepSizes() {
                var _this3 = this;

                this.chart.config.options.scales.xAxes.forEach(function (v, k) {
                    _this3.chart.config.options.scales.xAxes[k].time.stepSize = _this3.xAxesStepSizes[_this3.period];
                });
            }
        }, {
            key: "extend",
            value: function extend() {
                Chartjs.defaults.lineWithLine = Chartjs.defaults.line;
                Chartjs.defaults.lineWithLine.cursor = {
                    fontColor: this.contrast ? 'rgba(255,255,255,.4)' : '#333'
                };
                Chartjs.controllers.lineWithLine = Chartjs.controllers.line.extend({
                    draw: function draw(ease) {
                        Chartjs.controllers.line.prototype.draw.call(this, ease);

                        if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
                            var activePoint = this.chart.tooltip._active[0],
                                ctx = this.chart.ctx,
                                x = activePoint.tooltipPosition().x,
                                topY = this.chart.scales['y-axis-1'].top,
                                bottomY = this.chart.scales['y-axis-1'].bottom;

                            // draw line
                            ctx.save();
                            ctx.beginPath();
                            ctx.moveTo(x, topY);
                            ctx.lineTo(x, bottomY);
                            ctx.lineWidth = 1;
                            ctx.strokeStyle = Chartjs.defaults.lineWithLine.cursor.fontColor;
                            ctx.stroke();
                            ctx.restore();
                        }
                    }
                });
                Chartjs.defaults.global.legend.labels.fontColor = this.contrast ? '#ffffff' : "#666666";
                Chartjs.defaults.global.elements.line.borderWidth = 2;
                Chartjs.defaults.global.hover.intersect = false;
                Chartjs.defaults.scale.gridLines.drawBorder = false;
                Chartjs.defaults.scale.gridLines.drawTicks = false;
                Chartjs.defaults.scale.ticks.padding = 15;
                Chartjs.defaults.scale.ticks.fontColor = this.contrast ? '#777' : '#666666';
                Chartjs.Tooltip.positioners.mouse = function (elements, eventPosition) {
                    var tooltip = this;
                    return eventPosition;
                };
            }
        }, {
            key: "getTimeUnit",
            value: function getTimeUnit() {
                switch (this.period) {
                    case '1 day':
                        this.chartConfig.options.scales.xAxes[0].time.unit = 'hour';
                        break;
                    case '1 week':
                        this.chartConfig.options.scales.xAxes[0].time.unit = 'day';
                        break;
                    case '1 month':
                        this.chartConfig.options.scales.xAxes[0].time.unit = 'day';
                        break;
                    case '1 year':
                        this.chartConfig.options.scales.xAxes[0].time.unit = 'day';
                        break;
                    case 'all':
                        this.chartConfig.options.scales.xAxes[0].time.unit = 'day';
                        break;
                    default:
                        this.chartConfig.options.scales.xAxes[0].time.unit = 'day';
                }
            }
        }, {
            key: "drawChart",
            value: function drawChart(priceData) {
                var _this4 = this;

                var _this = this;
                this.chartConfig.options.scales.xAxes.forEach(function (v, k) {
                    _this4.chartConfig.options.scales.xAxes[k].time.stepSize = _this4.xAxesStepSizes[_this4.period];
                });
                var chart = this.chartContainer.find('canvas')[0].getContext('2d');
                this.chart = new Chartjs(chart, _this.chartConfig);
            }
        }, {
            key: "updateLabels",
            value: function updateLabels() {
                this.chart.data.datasets[0].label = "USD/" + this.currency;
                if (this.currency != 'Bitcoin') {
                    this.chart.data.datasets[1].label = "BTC/" + this.currency;
                }
            }
        }, {
            key: "updateChart",
            value: function updateChart(priceData) {
                var _this5 = this;

                this.updateXAxesStepSizes();
                if (this.priceData !== null) {
                    priceData = this.priceData;
                }
                this.chart.data.labels = [];
                this.chart.data.datasets[0].data = [];
                if (typeof this.chart.data.datasets[1] === 'undefined') {
                    this.chart.data.datasets[1] = {
                        data: []
                    };
                } else {
                    this.chart.data.datasets[1].data = [];
                }

                if (typeof this.chart.options.scales.yAxes[1] !== 'undefined') {
                    if (this.currency == 'Bitcoin') {
                        this.chart.options.scales.yAxes[1].display = false;
                        this.chart.data.datasets[1].hidden = true;
                    } else {
                        this.chart.options.scales.yAxes[1].display = true;
                        this.chart.data.datasets[1].hidden = false;
                    }
                }

                priceData.price_usd.forEach(function (v, k, a) {
                    _this5.chart.data.labels.push(v[0]);
                    _this5.chart.data.datasets[0].data.push(v[1]);
                });

                if (this.currency != 'Bitcoin') {
                    priceData.price_btc.forEach(function (v, k, a) {
                        _this5.chart.data.labels.push(v[0]);
                        _this5.chart.data.datasets[1].data.push(v[1]);
                    });
                }

                this.updateLabels();
                this.chart.update();
            }
        }, {
            key: "showPreloader",
            value: function showPreloader() {
                this.preloader.fadeIn();
            }
        }, {
            key: "hidePreloader",
            value: function hidePreloader() {
                this.preloader.fadeOut();
            }
        }, {
            key: "getCurrencyData",
            value: function getCurrencyData(callback) {
                this.showPreloader();
                var periodTimestamp = '';

                var _this = this;
                if (this.period !== 'all') {
                    var from = moment();
                    periodTimestamp = this.period.split(' ');
                    from.subtract(periodTimestamp[1], periodTimestamp[0]);
                    var to = moment();
                    periodTimestamp = from.format('x') + '/' + to.format('x');
                }

                // period = this.buttons['1d'][0] + '/' + this.buttons['1d'][1]; //update


                if (navigator.onLine) {
                    $.ajax({
                        url: ajaxurl,
                        method: 'get',
                        data: {
                            action: 'crypterio_get_currency_data',
                            currency: this.currency,
                            period: this.period,
                            periodTimestamp: periodTimestamp,
                            transient_exp: this.cacheExp,
                            security: window.wp_data.crypterio_get_currency_data
                        },
                        success: function success(res) {
                            if (res.responseCode === 200) {
                                _this.priceData = res;
                                callback.call(_this, res);
                                _this.hidePreloader();
                                _this.hideError();
                            } else {
                                _this.showError();
                            }
                        },
                        error: function error(_error) {
                            _this.showError();
                        }
                    });
                } else {
                    _this.showError();
                }
            }
        }, {
            key: "showError",
            value: function showError() {
                this.error.addClass('active');
            }
        }, {
            key: "hideError",
            value: function hideError() {
                this.error.removeClass('active');
            }
        }]);

        return StmCryptoCharts;
    }();

    $(window).load(function () {
        if(typeof VirtualCoinWidgets !== 'undefined') {
            var i = 0;
            window.stm_charts = [];
            // if (typeof VCWConstants !== 'undefined') {
            $('.stm_crypto_chart').each(function () {
                window.stm_charts[i] = new StmCryptoCharts(this);
                i += 1;
            });
        }
    });
})(jQuery);