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
            <span class="light mx-2"> 부터</span><br/>
            <span id="zoomEnd">{{ zoomEnd }}</span>
            <span class="light ml-2"> 까지</span>
        </p>
    </div>
    <div id="datas-input">
      <label for="startDate">검색 시작일:</label>
      <input type="date" id="startDate" v-model="startDate" />
      <label for="endDate">검색 종료일:</label>
      <input type="date" id="endDate" v-model="endDate" />
      <label>데이터 갯수</label>
      <input type="number" v-model="dataCount" />
    <button @click="updateChart">검색</button>
    </div>
</template>

<script setup lang="ts">

import { ref, onMounted } from 'vue';
import * as d3 from 'd3/build/d3';
import krLocale from 'd3-time-format/locale/ko-KR.json'
import eventDrops from 'event-drops';

const numberCommits = ref(0);
const zoomStart = ref('');
const zoomEnd = ref('');
const isHoverDisable = ref(false);
const dateFormat = d3.timeFormat('%Y-%m-%d %I:%M');

const startDate = ref('');
const endDate = ref('');
const dataCount = ref(0);

const initialCategoryCount = 4; // 초기 카테고리 수
const initialRepositoriesData: any[] = [];

// 초기 카테고리 생성
for (let i = 0; i < initialCategoryCount; i++) {
  initialRepositoriesData.push({
    name: `카테고리 ${i + 1}`,
    data: [ ],
  });
}

const chart = eventDrops({
    d3,
    locale: krLocale,
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
    zoom: {
      onZoomEnd: () => updateCommitsInformation(chart)
    },
    drop: {
        radius: 7,
        date: d => new Date(d.date),
        onMouseOver: commit => {
          isHoverDisable.value = false;
          tooltip
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("pointer-events", "auto");
          tooltip.html(
          `
          <div class="commit">
          <img class="avatar" src="${gravatar(commit.author.email)}" alt="${commit.author.name}" title="${commit.author.name}" />
          <div class="content">
            <h3 class="message">${commit.message}</h3>
            <p>
              <a href="https://www.github.com/${commit.author.name}" class="author">${commit.author.name}</a>
              on <span class="date">${humanizeDate(new Date(commit.date))}</span> -
              <a class="sha" href="${commit.sha}">${commit.sha.substr(0, 10)}</a>
            </p>
          </div>
          </div>
          `
          )
          .style("left", `${d3.event.pageX - 30}px`)
          .style("top", `${d3.event.pageY + 20}px`);
        },
        onMouseOut: () => {
            if (!isHoverDisable.value) {
              tooltip
                .transition()
                .duration(10)
                .style('display', 'none')
                .style('pointer-events', 'none');
            }
          },
        },
        // data: initialRepositoriesData,
        label: {
          padding: 20,
          text: d => `${d.name} (${d.data.length})`,
          width: 120,
        },
        indicator: {
          previousText: '◀',
          nextText: '▶'
        },
        line: {
          color: (_, index) => d3.schemeCategory10[index],
          height: 40,
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
        },
      });
  
    const updateCommitsInformation = () => {
      const filteredData = chart
      .filteredData()
      .reduce((total: any[], repo: any) => total.concat(repo.data), []);

      numberCommits.value = filteredData.length.toString();
      zoomStart.value = dateFormat(chart.scale().domain()[0]);
      zoomEnd.value = dateFormat(chart.scale().domain()[1]);
    };

    const drawChart = () => {
    //   if (initialRepositoriesData.length > 0) {
    //     // const repositoriesData = series.value.map((repository: any) => ({
    //     //   name: repository.name,
    //     //   data: repository.data,

    //   d3.select('#eventdrops-demo')
    //     .data([initialRepositoriesData])
    //     .call(chart);
    //   updateCommitsInformation();
    // }

      if (initialRepositoriesData.length > 0) {
      // 차트 요소 선택
        const chartElement = d3.select('#eventdrops-demo');
      // 기존에 그려진 차트가 있는지 확인
        const existingChart = chartElement.select('.event-drops-chart');
      // 새 차트를 추가하거나 기존 차트 위에 덧붙임
        const chartSelection = existingChart.empty() ? chartElement : existingChart;    
        chartSelection
        .data([initialRepositoriesData])
        .call(chart);
      // 정보 업데이트
      updateCommitsInformation();
      }
    };

    const updateChart  = () => {
      const start = new Date(startDate.value);
      const end = new Date(endDate.value);
      if(start > end) {
        alert('시작일은 종료일보다 이전이어야 함!');
        return;
      }

      for (let i = 0; i < dataCount.value; i++) {
          const randomDate = new Date(
            start.getTime() + Math.random() * (end.getTime() - start.getTime())
          );

          // 랜덤한 카테고리 선택
            const randomCategoryIndex = Math.floor(Math.random() * initialRepositoriesData.length);
            initialRepositoriesData[randomCategoryIndex].data.push({ date: randomDate });
            
          } 
        // 데이터가 추가된 후에 차트 그림
        drawChart();
      };
 

onMounted(() => {
  drawChart();
});
</script>


<style>
.infos {
  margin-top: 20px;
}
</style>