<template>
    <h1>Event Drops Test</h1>
	<div id="eventdrops-demo" style="width: 100%;"></div>
    <div class="infos">
        <p>건수 :
            <span id="numberCommits" class="mx-2">{{ numberCommits }}</span> 건
        </p>/
        <p>
            기간 :
            <span id="zoomStart" class="ml-2">{{ zoomStart }}</span>
            <span class="light mx-2">부터</span>
            <span id="zoomEnd">{{ zoomEnd }}</span>
            <span class="light ml-2">까지</span>
        </p>
    </div>
</template>

<script setup lang="ts">

import { ref, onMounted } from 'vue';
import * as d3 from 'd3/build/d3';
import krLocale from 'd3-time-format/locale/ko-KR.json'
import eventDrops from 'event-drops';

const chart = eventDrops({ d3 });

const numberCommits = ref(0);
const zoomStart = ref('');
const zoomEnd = ref('');
const isHoverDisable = ref(false);
const series = ref([]);

const repositoriesData = [
    {
        name: 'admin-on-rest',
        data: [{ date: new Date('2023/08/15 14:21:31') } /* ... */],
    },
    {
        name: 'event-drops',
        data: [{ date: new Date('2023/07/01 13:24:57') } /* ... */],
    },
    {
        name: 'sedy',
        data: [{ date: new Date('2023/05/15 13:25:12') } /* ... */],
    },
];

onMounted(() => {
  const chart = eventDrops({
    d3,
    locale: krLocale,
    metaballs: {
        blurDeviation: 10,
        colorMatrix: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 50 -10'
    },
    bound: {
        format: d3.timeFormat('%Y-%m-%d')
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
        tickPadding: 6        
    },
    drops: row => row.data,
        drop: {
          color: null,
          radius: 7,
          date: d => new Date(d.date),
          onClick: (data) => {
            this.isHoverDisable = true
          },
            onMouseOver: commit => {
                this.isHoverDisable = false
                this.tooltip.target
                .style('left', `${d3.event.offsetX - 25}px`)
                .style('top', `${d3.event.offsetY + 25}px`)
                this.getRawData(commit.id).then(itemdata => {
                // 검색엔진 날짜 추가
                itemdata.date = commit.date
                /* 수정 getAppIcon */
                this.tooltip.target
                    .transition()
                    .duration(10)
                    .style('display', 'block')
                    .style('pointer-events', 'auto')
                this.tooltip.data = this._.cloneDeep(itemdata)
                this.tooltip.data.appImage = this.getAppIcon(itemdata.appId)
                })
          },
          onMouseOut: () => {
            if (this.isHoverDisable == false) {
              this.tooltip.target
                .transition()
                .duration(10)
                .style('display', 'none')
                .style('pointer-events', 'none')
            }
          }
        },
        label: {
          padding: 20,
          text: d => `${d.name} (${d.data.length})`,
          width: 120
        },
        indicator: {
          previousText: '◀',
          nextText: '▶'
        },
        line: {
          color: (_, index) => d3.schemeCategory10[index],
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
          onZoomEnd: () => this.updateCommitsInformation(),
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
  },
    drawChart () {
        if (this.series.length > 0) {
        const repositoriesData = this.series.map(repository => ({
          name: repository.name,
          data: repository.data
        }))
        d3
        .select('#eventdrops-demo')
        .data([repositoriesData])
        .call(this.chart);
        this.updateCommitsInformation()
        }
    },
    updateCommitsInformation () {
      const filteredData = this.chart
        .filteredData()
        .reduce((total, repo) => total.concat(repo.data), [])
      this.numberCommits = filteredData.length
      this.zoomStart = dateFormat(this.chart.scale().domain()[0])
      this.zoomEnd = dateFormat(this.chart.scale().domain()[1])
    },
    setSeriesData (data) {
      this.series = data
    },

);
</script>


<style>
.infos {
  margin-top: 20px;
}
</style>