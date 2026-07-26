import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import KLineChart from './components/KLineChart';

interface KLineData {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    amount: number;
    涨幅?: string;
    振幅?: string;
    区间?: string;
}

interface ExtraSeries {
    name: string;
    id: string;
    data: KLineData[];
}

const ETF_OPTIONS = [
    { value: '510050', label: '上证50ETF', file: 'etf/510050_上证50ETF.csv' },
    { value: '510300', label: '沪深300ETF', file: 'etf/510300_沪深300ETF.csv' },
    { value: '563300', label: '中证2000ETF', file: 'etf/563300_中证2000ETF.csv' },
    { value: '159915', label: '创业板ETF', file: 'etf/159915_创业板ETF.csv' },
    { value: '512480', label: '半导体ETF', file: 'etf/512480_半导体ETF.csv' },
    { value: '588710', label: '科创半导体设备ETF', file: 'etf/588710_科创半导体设备ETF.csv' },
    { value: '515880', label: '通信ETF', file: 'etf/515880_通信ETF.csv' },
    { value: '159381', label: '创业板人工智能ETF', file: 'etf/159381_创业板人工智能ETF.csv' },
    { value: '516160', label: '新能源ETF', file: 'etf/516160_新能源ETF.csv' },
    { value: '515030', label: '新能源车ETF', file: 'etf/515030_新能源车ETF.csv' },
    { value: '512400', label: '有色ETF', file: 'etf/512400_有色ETF.csv' },
    { value: '510150', label: '消费ETF', file: 'etf/510150_消费ETF.csv' },
    { value: '515220', label: '煤炭ETF', file: 'etf/515220_煤炭ETF.csv' },
    { value: '512690', label: '白酒ETF', file: 'etf/512690_白酒ETF.csv' },
    { value: '512880', label: '证券ETF', file: 'etf/512880_证券ETF.csv' },
    { value: '512800', label: '银行ETF', file: 'etf/512800_银行ETF.csv' },
    { value: '159530', label: '机器人ETF', file: 'etf/159530_机器人ETF.csv' },
    { value: '510660', label: '创新药ETF', file: 'etf/510660_创新药ETF.csv' },
    { value: '159869', label: '游戏ETF', file: 'etf/159869_游戏ETF.csv' },
    { value: '516290', label: '光伏ETF', file: 'etf/516290_光伏ETF.csv' },
    { value: '561380', label: '电网设备ETF', file: 'etf/561380_电网设备ETF.csv' },
    { value: '159206', label: '卫星ETF', file: 'etf/159206_卫星ETF.csv' },
    { value: '159638', label: '高端装备ETF', file: 'etf/159638_高端装备ETF.csv' },
    { value: '512660', label: '军工ETF', file: 'etf/512660_军工ETF.csv' },
    { value: '159929', label: '医药ETF', file: 'etf/159929_医药ETF.csv' },
    { value: 'sh000001', label: '上证指数', file: 'index/000001_上证指数.csv' },
    { value: 'sh000300', label: '沪深300', file: 'index/000300_沪深300.csv' },
];

const ActiveMarket: React.FC = () => {
    const [data, setData] = useState<KLineData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showBullZoneBg, setShowBullZoneBg] = useState(false);
    const [showBearZoneBg, setShowBearZoneBg] = useState(false);
    const [selectedETFs, setSelectedETFs] = useState<string[]>([]);
    const [extraSeries, setExtraSeries] = useState<ExtraSeries[]>([]);
    const [allETFSeries, setAllETFSeries] = useState<ExtraSeries[]>([]);
    const [upperETFId, setUpperETFId] = useState<string | undefined>(undefined);
    const [chartZones, setChartZones] = useState<{ bull: { start: number; end: number }[]; bear: { start: number; end: number }[] } | undefined>(undefined);

    // 当前页面全屏展示图表，去除 body 默认 margin/padding 避免滚动条
    useEffect(() => {
        const originalMargin = document.body.style.margin;
        const originalPadding = document.body.style.padding;
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        return () => {
            document.body.style.margin = originalMargin;
            document.body.style.padding = originalPadding;
        };
    }, []);

    useEffect(() => {
        fetch('/0AMV-2013-2026.csv')
            .then(res => res.text())
            .then(text => {
                const lines = text.trim().split('\n');
                const parsedData = lines.slice(1).map(line => {
                    const values = line.split(',');
                    return {
                        date: values[0],
                        open: parseFloat(values[1]),
                        high: parseFloat(values[2]),
                        low: parseFloat(values[3]),
                        close: parseFloat(values[4]),
                        volume: parseFloat(values[5]),
                        amount: parseFloat(values[6]),
                        涨幅: values[7],
                        振幅: values[8],
                        区间: values[9]
                    };
                }).filter(item => !isNaN(item.open) && !isNaN(item.close));

                setData(parsedData);
                setLoading(false);
            })
            .catch(err => {
                console.error('加载数据失败:', err);
                setLoading(false);
            });
    }, []);

    // 加载所有板块 ETF 数据，用于计算区间排名
    useEffect(() => {
        const loadPromises = ETF_OPTIONS.map(option =>
            fetch(`/data/${option.file}`)
                .then(res => res.text())
                .then(text => {
                    const lines = text.trim().split('\n');
                    const parsedData = lines.slice(1).map(line => {
                        const values = line.split(',');
                        return {
                            date: values[0],
                            open: parseFloat(values[1]),
                            close: parseFloat(values[2]),
                            high: parseFloat(values[3]),
                            low: parseFloat(values[4]),
                            volume: parseFloat(values[5]),
                            amount: 0
                        };
                    }).filter(item => !isNaN(item.open) && !isNaN(item.close));
                    return { name: option.label, id: option.value, data: parsedData };
                })
                .catch(() => null)
        );

        Promise.all(loadPromises)
            .then(results => setAllETFSeries(results.filter(Boolean) as ExtraSeries[]));
    }, []);

    useEffect(() => {
        setExtraSeries(allETFSeries.filter(s => selectedETFs.includes(s.id)));
    }, [selectedETFs, allETFSeries]);

    if (loading) {
        return <div style={{ padding: 20, color: '#333' }}>加载中...</div>;
    }

    const activeMarketLastDate = data.length > 0 ? data[data.length - 1].date : undefined;
    const activeMarketDates = data.map(d => d.date);

    return (
        <div style={{ padding: 20, backgroundColor: '#f5f5f5', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
            <h1 style={{ color: '#333', marginBottom: 20, flexShrink: 0 }}>活跃市值 (0AMV)</h1>
            <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 15, flexShrink: 0 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={showBullZoneBg}
                        onChange={(e) => setShowBullZoneBg(e.target.checked)}
                        style={{ width: 16, height: 16 }}
                    />
                    <span style={{ color: '#666', fontSize: 14 }}>显示多头区间背景</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={showBearZoneBg}
                        onChange={(e) => setShowBearZoneBg(e.target.checked)}
                        style={{ width: 16, height: 16 }}
                    />
                    <span style={{ color: '#666', fontSize: 14 }}>显示空头区间背景</span>
                </label>
                <span style={{ color: '#999', fontSize: 14 }}>|</span>
                <span style={{ color: '#666', fontSize: 14 }}>叠加显示:</span>
                <Select
                    mode="multiple"
                    allowClear
                    placeholder="选择指数/ETF"
                    value={selectedETFs}
                    onChange={setSelectedETFs}
                    options={ETF_OPTIONS}
                    style={{ minWidth: 300, fontSize: 14 }}
                    maxTagCount="responsive"
                    size="middle"
                />
                <span style={{ color: '#999', fontSize: 14 }}>|</span>
                <span style={{ color: '#666', fontSize: 14 }}>上方副图:</span>
                <Select
                    allowClear
                    placeholder="选择ETF单独展示"
                    value={upperETFId}
                    onChange={setUpperETFId}
                    options={ETF_OPTIONS}
                    style={{ minWidth: 180, fontSize: 14 }}
                    size="middle"
                />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, gap: upperETFId ? 12 : 0 }}>
                {upperETFId && (
                    <div style={{ flex: '0 0 30%', minHeight: 220, display: 'flex', flexDirection: 'column', border: '1px solid #ddd', borderRadius: 4, padding: '8px 0', backgroundColor: '#fff' }}>
                        <div style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 4, padding: '0 12px', flexShrink: 0 }}>
                            {ETF_OPTIONS.find(o => o.value === upperETFId)?.label}（独立副图）
                        </div>
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <KLineChart
                                data={allETFSeries.find(s => s.id === upperETFId)?.data || []}
                                dataLabel={ETF_OPTIONS.find(o => o.value === upperETFId)?.label || ''}
                                mainSeriesName={ETF_OPTIONS.find(o => o.value === upperETFId)?.label || '日K'}
                                highlightThreshold={4}
                                showZones={true}
                                showBullZoneBg={showBullZoneBg}
                                showBearZoneBg={showBearZoneBg}
                                showRanking={false}
                                showVolume={false}
                                seriesType="line"
                                chartHeight="100%"
                                syncGroup="active-market-sync"
                                maxDate={activeMarketLastDate}
                                showDataZoom={false}
                                baseDates={activeMarketDates}
                                zones={chartZones}
                            />
                        </div>
                    </div>
                )}
                <div style={{ flex: 1, minHeight: 0 }}>
                    <KLineChart
                        data={data}
                        highlightThreshold={4}
                        showBullZoneBg={showBullZoneBg}
                        showBearZoneBg={showBearZoneBg}
                        extraSeries={extraSeries}
                        allETFSeries={allETFSeries}
                        syncGroup="active-market-sync"
                        chartHeight="100%"
                        onZonesChange={setChartZones}
                    />
                </div>
            </div>
        </div>
    );
};

export default ActiveMarket;