export const mixinSaveLoading = {
    data () {
        return {
            saveloading: false,
        }
    },
    watch: {
        saveloading: {
            handler(val) {
                if (val === true) {
                    this.clearHandle();
                } else {
                    clearInterval(this.setIntervalHand)
                }
            },
        }
    },
    methods: {
        //清空定时器
        clearHandle() {
            let setTimeData = this.API.api.setTime;
            this.setIntervalHand = setInterval(() => {
                if (setTimeData <= 0) {
                    this.saveloading = false;
                    clearInterval(this.setIntervalHand)
                } else {
                    setTimeData--;
                }
                console.log('setTimeData', setTimeData);
            }, 1000)
        },
    }
}