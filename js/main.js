var w = window,
    d = document;

//Создаем елемент audio
//audio

w.onload = function () {
    var target = d.querySelector('#target'),
        MAX_PARTICLES = 150, //максимально количество частиц
        SMOOTHING = 0.3,
        FURIE = 512,
    //FILE_PATH = 'files/test.mp3',
    RADIUS = {
        MAX: 80,
        MIN: 10
    },
        SIZE = {
            MIN: 0.5,
            MAX: 1.25
        },
        OPACITY = {
            MAX: 1,
            MIN: 0.4
        },
        COLORS = ['#69D2E7', '#A7DBD8', '#E0E4CC', '#F38630', '#FA6900', '#FF4E50', '#F9D423']; //цвета частиц


    var Analyser = function () {
        //Новый контекст
        var context = null,
            analyser = null,
            sourse = null,
            node = null,
            bands = null,
            source = null,
            AudioContext = w.AudioContext || w.webkitAudioContext,
            that = this;

        var audio = new Audio();
        audio.src = 'files/test.mp3';
        audio.controls = true;

        context = new AudioContext();
        node = context.createJavaScriptNode(2048, 1, 1);
        //Анализатор
        analyser = context.createAnalyser();
        analyser.smoothingTimeConstant = SMOOTHING;
        analyser.fftSize = FURIE;

        bands = new Uint8Array(analyser.frequencyBinCount);

        audio.addEventListener('canplay', function () {
            source = context.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(node);
            node.connect(context.destination);
            source.connect(context.destination);

            node.onaudioprocess = function () {
                analyser.getByteFrequencyData(bands);
                if (!audio.paused) {
                    return typeof that.update === "function" ? that.update(bands) : 0;
                }
            };
        });
        d.body.appendChild(audio);
        return that;
    };

    /*
    * Создание частицы
    * @param {int} x - координата по x
    * @param {int} y - координата по y
    * @return {Object}
    */
    var Particle = function (x, y) {
        this.init(x, y);
    };

    Particle.prototype = {
        //Параметры создаваемой частицы
        init: function (x, y) {
            this.radius = random(RADIUS.MIN, RADIUS.MAX); //радиус частиц
            this.color = random(COLORS); //цвет частицы
            this.opacity = random(OPACITY.MIN, OPACITY.MAX);
            this.band = floor(random(128));
            this.x = x;
            this.y = y;
            this.size = random(SIZE.MIN, SIZE.MAX);
        },
        draw: function (ctx) {

            ctx.save();
            ctx.beginPath(); //Начинает отрисовку фигуры
            ctx.arc(this.x, this.y, this.radius, 0, TWO_PI);
            ctx.fillStyle = this.color; //цвет
            ctx.globalAlpha = this.opacity; //прозрачность
            ctx.fill();
            ctx.stroke(); //завершаем отрисовку
            ctx.restore();
            /*
            ctx.save();
            ctx.beginPath();
            ctx.translate(this.x, this.y);
            //ctx.rotate(this.rotation);
            ctx.scale(20, 10);
            ctx.moveTo(this.size * 0.5, 0);
            ctx.lineTo(this.size * -0.5, 0);
            ctx.lineWidth = 1;
            ctx.lineCap = 'round';
            //ctx.globalAlpha = this.smoothedAlpha / this.level;
            ctx.strokeStyle = this.color;
            ctx.stroke();
            ctx.restore();*/
        },
        move: function () {
            this.y -= random(0.2, 0.5);

            //Возврашам в начало частицы которые ушли за пределы хослста
            if (this.y < -100) {
                this.y = region.height;
            }
        }
    }

    var region = Sketch.create({
        container: target//создаем конву
    });

    region.particles = [];

    region.setup = function () {
        var x = null,
            y = null,
            particle = null;

        //создание частиц
        for (var i = 0; i < MAX_PARTICLES; i++) {
            x = random(this.width);
            y = random(this.height * 2); //появление на пределами области
            particle = new Particle(x, y);
            this.particles.push(particle);
        }
        var audio = new Analyser();

        audio.update = function (bands) {
            var ln = region.particles.length;

            while (ln--) {
                var loc = region.particles[ln];
                loc.pulse = bands[loc.band]/256;
            }
        };
    };

    region.draw = function () {
        var len = this.particles.length;

        while (len--) {
            //console.log(this.particles[len].pulse);
            this.particles[len].move(); //движение
            this.particles[len].draw(region); //создание частиц
        }

    };
};