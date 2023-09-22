<template>
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

</script>


<style>
</style>