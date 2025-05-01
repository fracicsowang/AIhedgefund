import { StockData } from '@/types';

/**
 * 模拟的热门股票数据
 * 当API调用失败或开发环境使用
 */
export const mockFamousStocks: StockData[] = [
  // 科技股
  {
    symbol: 'AAPL',
    price: {
      regularMarketPrice: 172.4,
      regularMarketChange: 2.1,
      regularMarketChangePercent: 1.23,
      regularMarketDayHigh: 173.2,
      regularMarketDayLow: 170.8,
      regularMarketVolume: 67533000
    },
    quoteSummary: {
      longName: '苹果公司',
      defaultKeyStatistics: {
        forwardPE: { raw: 28.5, fmt: '28.5' },
        priceToBook: { raw: 37.2, fmt: '37.2' }
      }
    }
  },
  {
    symbol: 'MSFT',
    price: {
      regularMarketPrice: 341.3,
      regularMarketChange: 4.8,
      regularMarketChangePercent: 1.43,
      regularMarketDayHigh: 343.0,
      regularMarketDayLow: 338.2,
      regularMarketVolume: 22180000
    },
    quoteSummary: {
      longName: '微软公司',
      defaultKeyStatistics: {
        forwardPE: { raw: 32.1, fmt: '32.1' },
        priceToBook: { raw: 12.8, fmt: '12.8' }
      }
    }
  },
  {
    symbol: 'GOOG',
    price: {
      regularMarketPrice: 140.2,
      regularMarketChange: 1.6,
      regularMarketChangePercent: 1.15,
      regularMarketDayHigh: 141.5,
      regularMarketDayLow: 139.2,
      regularMarketVolume: 24500000
    },
    quoteSummary: {
      longName: '谷歌公司',
      defaultKeyStatistics: {
        forwardPE: { raw: 21.3, fmt: '21.3' },
        priceToBook: { raw: 6.1, fmt: '6.1' }
      }
    }
  },
  {
    symbol: 'AMZN',
    price: {
      regularMarketPrice: 127.8,
      regularMarketChange: -1.2,
      regularMarketChangePercent: -0.93,
      regularMarketDayHigh: 128.5,
      regularMarketDayLow: 126.2,
      regularMarketVolume: 43890000
    },
    quoteSummary: {
      longName: '亚马逊公司',
      defaultKeyStatistics: {
        forwardPE: { raw: 42.5, fmt: '42.5' },
        priceToBook: { raw: 8.2, fmt: '8.2' }
      }
    }
  },
  {
    symbol: 'META',
    price: {
      regularMarketPrice: 325.6,
      regularMarketChange: 5.3,
      regularMarketChangePercent: 1.65,
      regularMarketDayHigh: 327.1,
      regularMarketDayLow: 321.9,
      regularMarketVolume: 19270000
    },
    quoteSummary: {
      longName: '元宇宙公司',
      defaultKeyStatistics: {
        forwardPE: { raw: 23.2, fmt: '23.2' },
        priceToBook: { raw: 6.9, fmt: '6.9' }
      }
    }
  },
  {
    symbol: 'NVDA',
    price: {
      regularMarketPrice: 806.9,
      regularMarketChange: 16.3,
      regularMarketChangePercent: 2.06,
      regularMarketDayHigh: 810.5,
      regularMarketDayLow: 793.8,
      regularMarketVolume: 38200000
    },
    quoteSummary: {
      longName: '英伟达公司',
      defaultKeyStatistics: {
        forwardPE: { raw: 47.8, fmt: '47.8' },
        priceToBook: { raw: 35.6, fmt: '35.6' }
      }
    }
  },
  {
    symbol: 'TSLA',
    price: {
      regularMarketPrice: 180.5,
      regularMarketChange: -3.8,
      regularMarketChangePercent: -2.06,
      regularMarketDayHigh: 184.2,
      regularMarketDayLow: 179.1,
      regularMarketVolume: 112500000
    },
    quoteSummary: {
      longName: '特斯拉公司',
      defaultKeyStatistics: {
        forwardPE: { raw: 60.2, fmt: '60.2' },
        priceToBook: { raw: 12.3, fmt: '12.3' }
      }
    }
  },
  {
    symbol: 'NFLX',
    price: {
      regularMarketPrice: 592.1,
      regularMarketChange: 8.5,
      regularMarketChangePercent: 1.46,
      regularMarketDayHigh: 594.8,
      regularMarketDayLow: 587.2,
      regularMarketVolume: 4580000
    },
    quoteSummary: {
      longName: '奈飞公司',
      defaultKeyStatistics: {
        forwardPE: { raw: 38.5, fmt: '38.5' },
        priceToBook: { raw: 16.2, fmt: '16.2' }
      }
    }
  },
  {
    symbol: 'PYPL',
    price: {
      regularMarketPrice: 65.3,
      regularMarketChange: -0.9,
      regularMarketChangePercent: -1.36,
      regularMarketDayHigh: 66.1,
      regularMarketDayLow: 64.8,
      regularMarketVolume: 12700000
    },
    quoteSummary: {
      longName: 'PayPal公司',
      defaultKeyStatistics: {
        forwardPE: { raw: 18.3, fmt: '18.3' },
        priceToBook: { raw: 3.9, fmt: '3.9' }
      }
    }
  },
  {
    symbol: 'INTC',
    price: {
      regularMarketPrice: 32.6,
      regularMarketChange: 0.4,
      regularMarketChangePercent: 1.24,
      regularMarketDayHigh: 32.9,
      regularMarketDayLow: 32.3,
      regularMarketVolume: 38100000
    },
    quoteSummary: {
      longName: '英特尔公司',
      defaultKeyStatistics: {
        forwardPE: { raw: 22.8, fmt: '22.8' },
        priceToBook: { raw: 1.2, fmt: '1.2' }
      }
    }
  },
  // 金融股
  {
    symbol: 'JPM',
    price: {
      regularMarketPrice: 187.3,
      regularMarketChange: 2.1,
      regularMarketChangePercent: 1.13,
      regularMarketDayHigh: 188.2,
      regularMarketDayLow: 186.5,
      regularMarketVolume: 8760000
    },
    quoteSummary: {
      longName: '摩根大通',
      defaultKeyStatistics: {
        forwardPE: { raw: 12.7, fmt: '12.7' },
        priceToBook: { raw: 1.8, fmt: '1.8' }
      }
    }
  },
  {
    symbol: 'BAC',
    price: {
      regularMarketPrice: 35.8,
      regularMarketChange: 0.3,
      regularMarketChangePercent: 0.84,
      regularMarketDayHigh: 36.1,
      regularMarketDayLow: 35.6,
      regularMarketVolume: 42300000
    },
    quoteSummary: {
      longName: '美国银行',
      defaultKeyStatistics: {
        forwardPE: { raw: 10.9, fmt: '10.9' },
        priceToBook: { raw: 1.1, fmt: '1.1' }
      }
    }
  },
  {
    symbol: 'V',
    price: {
      regularMarketPrice: 279.8,
      regularMarketChange: 1.5,
      regularMarketChangePercent: 0.54,
      regularMarketDayHigh: 280.7,
      regularMarketDayLow: 278.9,
      regularMarketVolume: 5980000
    },
    quoteSummary: {
      longName: 'Visa公司',
      defaultKeyStatistics: {
        forwardPE: { raw: 26.3, fmt: '26.3' },
        priceToBook: { raw: 13.2, fmt: '13.2' }
      }
    }
  },
  {
    symbol: 'MA',
    price: {
      regularMarketPrice: 458.2,
      regularMarketChange: 3.1,
      regularMarketChangePercent: 0.68,
      regularMarketDayHigh: 459.5,
      regularMarketDayLow: 456.7,
      regularMarketVolume: 2540000
    },
    quoteSummary: {
      longName: '万事达卡',
      defaultKeyStatistics: {
        forwardPE: { raw: 29.7, fmt: '29.7' },
        priceToBook: { raw: 45.6, fmt: '45.6' }
      }
    }
  },
  // 消费零售
  {
    symbol: 'WMT',
    price: {
      regularMarketPrice: 65.2,
      regularMarketChange: 0.7,
      regularMarketChangePercent: 1.08,
      regularMarketDayHigh: 65.4,
      regularMarketDayLow: 64.9,
      regularMarketVolume: 15690000
    },
    quoteSummary: {
      longName: '沃尔玛',
      defaultKeyStatistics: {
        forwardPE: { raw: 26.1, fmt: '26.1' },
        priceToBook: { raw: 5.8, fmt: '5.8' }
      }
    }
  },
  {
    symbol: 'PG',
    price: {
      regularMarketPrice: 166.7,
      regularMarketChange: 1.2,
      regularMarketChangePercent: 0.72,
      regularMarketDayHigh: 167.1,
      regularMarketDayLow: 166.1,
      regularMarketVolume: 6320000
    },
    quoteSummary: {
      longName: '宝洁公司',
      defaultKeyStatistics: {
        forwardPE: { raw: 24.9, fmt: '24.9' },
        priceToBook: { raw: 7.6, fmt: '7.6' }
      }
    }
  },
  {
    symbol: 'KO',
    price: {
      regularMarketPrice: 61.8,
      regularMarketChange: 0.3,
      regularMarketChangePercent: 0.49,
      regularMarketDayHigh: 62.0,
      regularMarketDayLow: 61.7,
      regularMarketVolume: 12390000
    },
    quoteSummary: {
      longName: '可口可乐',
      defaultKeyStatistics: {
        forwardPE: { raw: 23.8, fmt: '23.8' },
        priceToBook: { raw: 10.6, fmt: '10.6' }
      }
    }
  },
  {
    symbol: 'DIS',
    price: {
      regularMarketPrice: 93.5,
      regularMarketChange: -1.3,
      regularMarketChangePercent: -1.37,
      regularMarketDayHigh: 94.2,
      regularMarketDayLow: 93.2,
      regularMarketVolume: 10250000
    },
    quoteSummary: {
      longName: '迪士尼',
      defaultKeyStatistics: {
        forwardPE: { raw: 19.5, fmt: '19.5' },
        priceToBook: { raw: 1.7, fmt: '1.7' }
      }
    }
  },
  {
    symbol: 'MCD',
    price: {
      regularMarketPrice: 285.9,
      regularMarketChange: 3.2,
      regularMarketChangePercent: 1.13,
      regularMarketDayHigh: 286.5,
      regularMarketDayLow: 283.8,
      regularMarketVolume: 3120000
    },
    quoteSummary: {
      longName: '麦当劳',
      defaultKeyStatistics: {
        forwardPE: { raw: 26.3, fmt: '26.3' },
        priceToBook: { raw: 28.4, fmt: '28.4' }
      }
    }
  },
  {
    symbol: 'NKE',
    price: {
      regularMarketPrice: 96.8,
      regularMarketChange: 1.1,
      regularMarketChangePercent: 1.15,
      regularMarketDayHigh: 97.3,
      regularMarketDayLow: 96.2,
      regularMarketVolume: 8470000
    },
    quoteSummary: {
      longName: '耐克',
      defaultKeyStatistics: {
        forwardPE: { raw: 31.6, fmt: '31.6' },
        priceToBook: { raw: 12.8, fmt: '12.8' }
      }
    }
  },
  // 医药健康
  {
    symbol: 'JNJ',
    price: {
      regularMarketPrice: 153.2,
      regularMarketChange: -0.6,
      regularMarketChangePercent: -0.39,
      regularMarketDayHigh: 153.8,
      regularMarketDayLow: 152.9,
      regularMarketVolume: 7360000
    },
    quoteSummary: {
      longName: '强生',
      defaultKeyStatistics: {
        forwardPE: { raw: 14.9, fmt: '14.9' },
        priceToBook: { raw: 4.8, fmt: '4.8' }
      }
    }
  },
  {
    symbol: 'PFE',
    price: {
      regularMarketPrice: 28.7,
      regularMarketChange: 0.4,
      regularMarketChangePercent: 1.41,
      regularMarketDayHigh: 28.9,
      regularMarketDayLow: 28.5,
      regularMarketVolume: 33190000
    },
    quoteSummary: {
      longName: '辉瑞',
      defaultKeyStatistics: {
        forwardPE: { raw: 11.3, fmt: '11.3' },
        priceToBook: { raw: 2.1, fmt: '2.1' }
      }
    }
  },
  {
    symbol: 'MRK',
    price: {
      regularMarketPrice: 121.3,
      regularMarketChange: 1.6,
      regularMarketChangePercent: 1.34,
      regularMarketDayHigh: 121.8,
      regularMarketDayLow: 120.7,
      regularMarketVolume: 8930000
    },
    quoteSummary: {
      longName: '默克',
      defaultKeyStatistics: {
        forwardPE: { raw: 14.2, fmt: '14.2' },
        priceToBook: { raw: 7.3, fmt: '7.3' }
      }
    }
  },
  {
    symbol: 'ABBV',
    price: {
      regularMarketPrice: 162.8,
      regularMarketChange: 0.9,
      regularMarketChangePercent: 0.56,
      regularMarketDayHigh: 163.2,
      regularMarketDayLow: 162.3,
      regularMarketVolume: 5670000
    },
    quoteSummary: {
      longName: '艾伯维',
      defaultKeyStatistics: {
        forwardPE: { raw: 14.5, fmt: '14.5' },
        priceToBook: { raw: 24.6, fmt: '24.6' }
      }
    }
  },
  {
    symbol: 'UNH',
    price: {
      regularMarketPrice: 520.7,
      regularMarketChange: -3.2,
      regularMarketChangePercent: -0.61,
      regularMarketDayHigh: 523.1,
      regularMarketDayLow: 518.9,
      regularMarketVolume: 2890000
    },
    quoteSummary: {
      longName: '联合健康',
      defaultKeyStatistics: {
        forwardPE: { raw: 20.7, fmt: '20.7' },
        priceToBook: { raw: 5.6, fmt: '5.6' }
      }
    }
  },
  // 其他热门股票
  {
    symbol: 'ADBE',
    price: {
      regularMarketPrice: 482.3,
      regularMarketChange: 7.8,
      regularMarketChangePercent: 1.64,
      regularMarketDayHigh: 485.2,
      regularMarketDayLow: 478.5,
      regularMarketVolume: 3240000
    },
    quoteSummary: {
      longName: 'Adobe',
      defaultKeyStatistics: {
        forwardPE: { raw: 32.4, fmt: '32.4' },
        priceToBook: { raw: 15.6, fmt: '15.6' }
      }
    }
  },
  {
    symbol: 'CRM',
    price: {
      regularMarketPrice: 252.8,
      regularMarketChange: 3.4,
      regularMarketChangePercent: 1.36,
      regularMarketDayHigh: 254.1,
      regularMarketDayLow: 250.9,
      regularMarketVolume: 6790000
    },
    quoteSummary: {
      longName: 'Salesforce',
      defaultKeyStatistics: {
        forwardPE: { raw: 26.3, fmt: '26.3' },
        priceToBook: { raw: 3.7, fmt: '3.7' }
      }
    }
  },
  {
    symbol: 'CSCO',
    price: {
      regularMarketPrice: 48.6,
      regularMarketChange: 0.2,
      regularMarketChangePercent: 0.41,
      regularMarketDayHigh: 48.8,
      regularMarketDayLow: 48.4,
      regularMarketVolume: 18370000
    },
    quoteSummary: {
      longName: '思科',
      defaultKeyStatistics: {
        forwardPE: { raw: 13.6, fmt: '13.6' },
        priceToBook: { raw: 4.3, fmt: '4.3' }
      }
    }
  },
  {
    symbol: 'ORCL',
    price: {
      regularMarketPrice: 126.2,
      regularMarketChange: 1.9,
      regularMarketChangePercent: 1.53,
      regularMarketDayHigh: 126.7,
      regularMarketDayLow: 125.3,
      regularMarketVolume: 9230000
    },
    quoteSummary: {
      longName: '甲骨文',
      defaultKeyStatistics: {
        forwardPE: { raw: 24.9, fmt: '24.9' },
        priceToBook: { raw: 28.5, fmt: '28.5' }
      }
    }
  },
  {
    symbol: 'AMD',
    price: {
      regularMarketPrice: 158.7,
      regularMarketChange: 4.2,
      regularMarketChangePercent: 2.72,
      regularMarketDayHigh: 159.3,
      regularMarketDayLow: 156.2,
      regularMarketVolume: 51280000
    },
    quoteSummary: {
      longName: 'AMD',
      defaultKeyStatistics: {
        forwardPE: { raw: 42.8, fmt: '42.8' },
        priceToBook: { raw: 3.9, fmt: '3.9' }
      }
    }
  }
]; 