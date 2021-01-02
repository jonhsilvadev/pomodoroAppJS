const app = {

    TIME_LIMIT: 1500,
    full_dash_array: 283,
    timePassed: 0,
    timeLeft: this.TIME_LIMIT,
    timerInterval: null,
    
    config:{
        times:{
            time_pomodoro: 1500,
            time_short_break: 300,
            time_long_break: 900,
        },
        defaultColor: "green"
    },

    initialize(){

        this.loadConfig();

        document
        .getElementById('application')
        .innerHTML = `<div class="app_timer">
            <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <g class="base-timer__circle">
                <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
                <path id="base-timer-path-remaining" stroke-dasharray="283" class="base-timer__path-remaining" d="M 50, 50 m -45, 0 a 45,45 0 1,0 90,0 a 45,45 0 1,0 -90,0"></path>
                </g>
            </svg>
            <span id="base-timer-label" class="base-timer__label">${app.formatTime(app.timeLeft)}</span>
            <span id="action" data-action="start">INICIAR</span>
        </div>`;

    },

    control(){
            document.getElementById('action').addEventListener('click', function(){
            let action = document.getElementById('action');
            let actionActive = action.getAttribute("data-action");
            
            if(actionActive === "start"){
                app.timerInterval = setInterval(() => {
                    app.timePassed = app.timePassed += 1;
                    app.timeLeft = app.TIME_LIMIT - app.timePassed;
                    document.getElementById("base-timer-label").innerHTML = app.formatTime(
                      app.timeLeft
                    );
                    app.setCircleDasharray();
                
                    if (app.timeLeft === 0) {

                        action.setAttribute("data-action", 'start');
                        action.innerHTML = "INICIAR";

                        app.playSound();

                        app.resetTime();

                        app.showPopup('popup_endtime');
                    }
                  }, 1000);
    
                  action.setAttribute("data-action", 'pause');
                  action.innerHTML = "PAUSAR";
            }else{
                app.onTimesUp();
                action.setAttribute("data-action", 'start');
                action.innerHTML = "INICIAR";
            }
        })
    },

    resetTime(){
        let action = document.getElementById('action');
        let actionActive = action.getAttribute("data-action");

        this.onTimesUp();
        this.timePassed = 0;

        if(actionActive === "pause"){
            action.setAttribute("data-action", 'start');
            action.innerHTML = "INICIAR";
        }
        
        this.initialize();
        this.control();
    },

    onTimesUp() {
        clearInterval(app.timerInterval);
    },

    formatTime(time) {
        const minutes = Math.floor(time / 60);
        let seconds = time % 60;
      
        if (seconds < 10) {
          seconds = `0${seconds}`;
        }
      
        return `${minutes}:${seconds}`;
    },

    calculateTimeFraction() {
        const rawTimeFraction = app.timeLeft / app.TIME_LIMIT;
        return rawTimeFraction - (1 / app.TIME_LIMIT) * (1 - rawTimeFraction);
    },

    setCircleDasharray() {
    const circleDasharray = `${(
          app.calculateTimeFraction() * app.full_dash_array
        ).toFixed(0)} 283`;
        document
          .getElementById("base-timer-path-remaining")
          .setAttribute("stroke-dasharray", circleDasharray);
    },

    loadConfig(){
        
        let tabActive = document.querySelector('.tab_target.active');
        let tabActiveTimeMode = tabActive.getAttribute('data-component');

        if(localStorage.getItem('config_app')){
            let timePomodoro = document.querySelector('input[name="pomodoro"]');
            let timeShortBreak = document.querySelector('input[name="short_break"]');
            let timeLongBreak = document.querySelector('input[name="long_break"]');

            let config_saved = JSON.parse(localStorage.getItem('config_app'));

            this.config = config_saved;

            timePomodoro.value = this.convertSegToMin(config_saved.times.time_pomodoro);
            timeShortBreak.value = this.convertSegToMin(config_saved.times.time_short_break);
            timeLongBreak.value = this.convertSegToMin(config_saved.times.time_long_break);

            document.querySelector('.color_select.active').classList.remove('active');
            document.querySelector(`.select_colors .color_select[data-color="${config_saved.defaultColor}"]`).classList.add('active');

            app.TIME_LIMIT = config_saved.times[`time_${tabActiveTimeMode}`];
        }

        let colorsOption = document.querySelectorAll('.color_select');

        for (var i = 0; i < colorsOption.length; i++) {
            colorsOption[i].addEventListener('click', function(event) {
                this.classList.add('active');
            });
        }

        // SET COLOR
        let bodyElement = document.querySelector('body');
        bodyElement.className = '';
        bodyElement.classList.add(this.config.defaultColor);

        // SET TIME LIMIT
        app.timeLeft = app.TIME_LIMIT;
    },

    setConfig(){
            let timePomodoro = document.querySelector('input[name="pomodoro"]');
            let timeShortBreak = document.querySelector('input[name="short_break"]');
            let timeLongBreak = document.querySelector('input[name="long_break"]');
            let bodyElement = document.querySelector('body');

            let config_saved = JSON.parse(localStorage.getItem('config_app'));

            this.config = config_saved;

            timePomodoro.value = this.convertSegToMin(config_saved.times.time_pomodoro);
            timeShortBreak.value = this.convertSegToMin(config_saved.times.time_short_break);
            timeLongBreak.value = this.convertSegToMin(config_saved.times.time_long_break);


            document.querySelector('.color_select.active').classList.remove('active');
            document.querySelector(`.select_colors .color_select[data-color="${config_saved.defaultColor}"]`).classList.add('active');

            // SET COLOR
            bodyElement.className = '';
            bodyElement.classList.add(this.config.defaultColor);

            // SET TIME LIMIT
            let tabActive = document.querySelector('.tab_target.active');
            let tabActiveTimeMode = tabActive.getAttribute('data-component');
            app.TIME_LIMIT = config_saved.times[`time_${tabActiveTimeMode}`];

            app.timeLeft = app.TIME_LIMIT - app.timePassed;
            document.getElementById("base-timer-label").innerHTML = app.formatTime(app.timeLeft);
    },

    saveConfig(){
        let timePomodoro = document.querySelector('input[name="pomodoro"]').value;
        let timeShortBreak = document.querySelector('input[name="short_break"]').value;
        let timeLongBreak = document.querySelector('input[name="long_break"]').value;
        let colorSelected = document.querySelector('.select_colors .color_select.active').getAttribute('data-color');

        let newConfig = {
                times:{
                    time_pomodoro: this.convertMinToSeg(timePomodoro),
                    time_short_break: this.convertMinToSeg(timeShortBreak),
                    time_long_break: this.convertMinToSeg(timeLongBreak),
                },
                defaultColor: colorSelected
        }

        let confirmChanges = confirm("Deseja salvar alteração?");

        if(confirmChanges){
            localStorage.setItem('config_app', JSON.stringify(newConfig));
            alert("Configurações foram salvas!");
            
            this.setConfig();
            this.closePopup('popup_config');
        }
        
    },

    convertMinToSeg(minutes){
        return parseInt(Math.floor(minutes * 3600 / 60));
    },

    convertSegToMin(minutes){
        return parseInt(Math.floor(minutes % 3600 / 60));
    },

    changeTabTime(){
        let tabs = document.querySelectorAll('.tab_target');
        
        
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].addEventListener('click', function(event) {
                let tabActive = document.querySelector('.tab_target.active');
                let action = document.getElementById('action');
                let actionActive = action.getAttribute("data-action");
                
                tabActive.classList.remove('active');
                

                if(actionActive === "pause"){
                    action.setAttribute("data-action", 'start');
                    action.innerHTML = "INICIAR";
                }
                
                app.onTimesUp();

                let typeTime = this.getAttribute('data-component');
                let timeConfig = app.config.times[`time_${typeTime}`];

                app.TIME_LIMIT = timeConfig;
                app.timePassed = 0;

                app.timeLeft = app.TIME_LIMIT - app.timePassed;

                document.getElementById("base-timer-label").innerHTML = app.formatTime(app.timeLeft);

                this.classList.add('active');
            });
        }
    },

    clearColorSelect(){

        let colorsOption = document.querySelector('.color_select.active');
        colorsOption.classList.remove('active');
        
    },

    showPopup(idPopup){
        let popup = document.getElementById(`${idPopup}`);
        popup.setAttribute('style', 'display:flex');
    },

    closePopup(idPopup){
        let popup = document.getElementById(`${idPopup}`);
        popup.setAttribute('style', 'display:none');
    },

    playSound(){
        let audioEl = document.querySelector('audio');
        audioEl.play();
    }
}

app.initialize();
app.control();
app.changeTabTime();