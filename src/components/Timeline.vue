<!-- <template>
    <h1>Event Drops Demo</h1>
	<div id="eventdrops-demo" style="width: 90%;"></div>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import * as d3 from 'd3/build/d3';
import eventDrops from 'event-drops';

const chart = eventDrops({ d3, });

const repositoriesData = [
    {
        name: 'admin-on-rest',
        data: [{ date: new Date('2014/09/15 14:21:31') } /* ... */],
    },
    {
        name: 'event-drops',
        data: [{ date: new Date('2014/09/15 13:24:57') } /* ... */],
    },
    {
        name: 'sedy',
        data: [{ date: new Date('2014/09/15 13:25:12') } /* ... */],
    },
];

onMounted(() => {
  const chart = eventDrops({ d3 });
  d3.select('#eventdrops-demo').data([repositoriesData]).call(chart);
});

</script> -->


<template>
    <div class="chart-wrap">
	    <div id="eventdrops-demo" style="width: 90%;"></div>
        <div class="chart-bot">
            <p class="count">건수 :
                <span id="numberCommits" class="mx-2">{{ numberCommits }}</span> 건
            </p>
            <span>/</span>
            <p class="date">
                기간 :
                <span id="zoomStart" class="ml-2">{{ zoomStart }}</span>
                <span class="light mx-2">부터 </span>
                <span id="zoomEnd">{{ zoomEnd }}</span>
                <span class="light ml-2">까지</span>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">

import { ref, onMounted } from 'vue';
import * as d3 from 'd3/build/d3';
import krLocale from 'd3-time-format/locale/ko-KR.json'
import eventDrops from 'event-drops';
import { repositories } from './data.js'


const numberCommits = ref(0);
const zoomStart = ref('');
const zoomEnd = ref('');
const dateFormat = d3.timeFormat('%Y-%m-%d %I:%M');

// 데이터
const repositoriesData = repositories.map(repository => ({
  name: repository.name,
  data: repository.commits
}));

// 데이터 업데이트
const updateCommitsInformation = (chart) => {
  const filteredData = chart.filteredData().reduce((total, repo) => total.concat(repo.data), []);

  numberCommits.value = filteredData.length;
  zoomStart.value = dateFormat(chart.scale().domain()[0]);
  zoomEnd.value = dateFormat(chart.scale().domain()[1]);
};

// 라벨 컬러값
let myColor = ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f", "#B762C6", "#5E97F5"];

// 툴팁
const tooltip = d3
  .select("body")
  .append("div")
  .classed("tooltip", true)
  .style("opacity", 0)
  .style("pointer-events", "auto");

// 차트
const chart = eventDrops({
    d3,
    locale: krLocale,
    bound: {
        format: d3.timeFormat('%Y-%m-%d')
    },
    metaballs: {
        blurDeviation: 10,
        colorMatrix: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 50 -10'
    },
    axis: {
        formats: {
          milliseconds: '%L',
          seconds: ':%S',
          minutes: '%I:%M',
          hours: '%I %p',
          days: '%a %d',
          weeks: '%b %d',
          months: '%B',
          year: '%Y'
        },
        verticalGrid: false,
        tickPadding: 6,
    },
    drops: row => row.data,
    drop: {
        // 데이터 색깔 null이면 라벨과 동일
        color: null,

        date: d => new Date(d.date),
        radius: 5,

        // 툴팁 마우스오버
        onMouseOver: commit => {
            tooltip
                .transition()
                .duration(200)
                .style("opacity", 1)
                .style("pointer-events", "auto");

            tooltip
                .html(
                `<div class="commit">
                    <div class="content">
                        <h3 class="date">${dateFormat(new Date(commit.date))}</h3>
                        <p>
                            <strong class="os"><span>- OS 정보 : </span>${commit.info.OS}</strong>
                            <strong class="buildNum"><span>- 빌드 번호 : </span>${commit.info.buildNum}</strong>
                        </p>
                    </div>
                </div>`
                )
                .style("left", `${d3.event.pageX - 30}px`)
                .style("top", `${d3.event.pageY + 20}px`);
        },
        onMouseOut: () => {
            tooltip
                .transition()
                .duration(500)
                .style("opacity", 0)
                .style("pointer-events", "none");
        }
    },
    label: {
          padding: 20,
          text: d => `${d.name} (${d.data.length})`,
          width: 200,
          
        },
    indicator: {
          previousText: '◀',
          nextText: '▶'
    },
    line: {
        // color: (_, index) => d3.schemeCategory10[index],
        color : (_, index) => myColor[index],
        height: 40
    },
    margin: {
        top: 30,
        right: 10,
        bottom: 10,
        left: 10
    },
    range: {
          start: new Date(new Date().getTime() - 3600000 * 24 * 365 * 5), // 5 years ago
          end: new Date()
    },
    zoom: {
        onZoomStart: null,
        onZoom: null,
        onZoomEnd: () => updateCommitsInformation(chart),
        minimumScale: 0,
        maximumScale: Infinity
    },
    numberDisplayedTicks: {
        small: 3,
        medium: 5,
        large: 7,
        extra: 12
    },
    breakpoints: {
        small: 576,
        medium: 768,
        large: 992,
        extra: 1200
    }
})

onMounted(() => {

    d3.select('#eventdrops-demo')
    .data([repositoriesData])
    .call(chart)

    updateCommitsInformation(chart);

});
</script>


<style>
.chart-wrap {
  margin: 100px 0;
}
.chart-bot {
  display: flex;
  justify-content: center;
  align-items: center;
}
.chart-bot > p {
  padding: 10px;
}
.axis {
    stroke: #fff
}
.domain {
    stroke: #fff;
}
.tick > line{
    stroke: #fff;
}
.bound.start, .bound.end{
    fill: #fff;
}
.line-label {
    font-weight: bold;
    font-size: 14px;
}
</style>