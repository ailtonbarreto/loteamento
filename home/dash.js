window.addEventListener("DOMContentLoaded", () => {

    window.addEventListener("lotesCarregados", () => {
        gerarGraficoStatus();
        gerarGraficoFunil();
    });

    window.gerarGraficoStatus = function () {

        const lotes = window.lotes;

        let disponivel = 0;
        let vendido = 0;
        let reservado = 0;
        let bloqueado = 0;

        Object.values(lotes).forEach(lote => {
            const status = lote.status.toLowerCase();
            const valor = Number(lote.valor);

            if (status === "disponível") disponivel += valor;
            else if (status === "vendido") vendido += valor;
            else if (status === "reservado") reservado += valor;
            else if (status === "bloqueado") bloqueado += valor;
        });

        let dados = [
            { nome: "Disponível", valor: disponivel, cor: "#29DE05" },
            { nome: "Vendido", valor: vendido, cor: "#02b1dd" },
            { nome: "Reservado", valor: reservado, cor: "#DEAB05" },
            { nome: "Bloqueado", valor: bloqueado, cor: "#de0505" }
        ];

        dados.sort((b, a) => b.valor - a.valor);

        const nomes = dados.map(d => d.nome);
        const valores = dados.map(d => d.valor);
        const cores = dados.map(d => d.cor);

        const chartDom = document.getElementById('bar_chart');
        const myChart = echarts.init(chartDom);

        const option = {
            tooltip: {
                trigger: "item",
                formatter: (params) => {
                    return `${params.name}: ${params.value.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL"
                    })}`;
                }
            },
            grid: {
                left: "5%",
                right: "5%",
                bottom: "5%",
                top: "10%",
                containLabel: true
            },
            xAxis: { show: false },
            yAxis: {
                type: "category",
                data: nomes,
                axisLabel: { color: "#0a0404", fontSize: 14 }
            },
            series: [
                {
                    type: "bar",
                    data: valores,
                    barWidth: 35,
                    label: {
                        show: true,
                        position: "right",
                        overflow: "break",
                        color: "#050202",
                        fontSize: 14,
                        formatter: (value) => {
                            return value.value.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL"
                            });
                        }
                    },
                    itemStyle: {
                        color: function (params) {
                            return cores[params.dataIndex];
                        },
                        borderRadius: 4
                    }
                }
            ]
        };

        myChart.setOption(option);
    }

    function gerarGraficoFunil() {
        const chartDom = document.getElementById('graficoFunil');
        const myChart = echarts.init(chartDom);

        const option = {
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b} : {c}%'
            },
            series: [
                {
                    name: 'Fase',
                    type: 'funnel',
                    left: '0%',
                    top: 30,
                    bottom: 24,
                    width: '100%',
                    min: 0,
                    max: 100,
                    minSize: '0%',
                    maxSize: '90%',
                    sort: 'descending',
                    gap: 5,
                    label: {
                        show: true,
                        position: 'inside'
                    },
                    data: [
                        { value: 100, name: 'Exposição' },
                        { value: 80, name: 'Interessados' },
                        { value: 60, name: 'Visitas' },
                        { value: 40, name: 'Propostas' },
                        { value: 20, name: 'Vendas' }
                    ]
                }
            ]
        };

        myChart.setOption(option);
    }
});
