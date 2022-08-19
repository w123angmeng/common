<template>
    <div class="skeleton flex-col">
        <div class="skeletonLeft flex h-center v-center">
            <div class="item"></div>
        </div>
        <div class="skeletonCon flex-col">
            <div class="row">
                <div class="item"></div>
            </div>
            <div class="row">
                <div class="item"></div>
            </div>
        </div>
        <div class="skeletonRight">
            <div class="row flex">
                <div class="item" style="width: 123px;"></div>
                <div class="item item--s"></div>
                <div class="item item--s"></div>
            </div>
            <div class="row">
                <div class="item" style="width: 140px;"></div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        
    }
</script>

<style src='./index.scss' lang="scss" scoped></style>