const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

// ===================================================== //
const CONTROL_SETTING_KEY = 'SETTING'
// ===================================================== //

const cd = $('.cd')
const heading = $('header h2')
const cdImg = $('.cd .cd-thumb')
const audio = $('audio')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')


// =====================================================
const app = {
    isPlaying: false,
    currentIndex: 0,
    isRandom: false,
    isRepeat: false,
    control: JSON.parse(localStorage.getItem(CONTROL_SETTING_KEY)) || {},
    songs: [
        {
            nameSong: "Burn Out",
            img: "img/burn-out.jpg",
            audio: "audio/burn-out.mp3",
            singer: "Martin Garrix"
        },
        {
            nameSong: "Happy",
            img: "img/happy.jpg",
            audio: "audio/happy.mp3",
            singer: "Pharrell Williams"
        },
        {
            nameSong: "Sugar",
            img: "img/sugar.jpg",
            audio: "audio/sugar.mp3",
            singer: "Maroon 5"
        },
        {
            nameSong: "Yêu đương khó quá thì chạy về khóc với anh",
            img: "img/yeu-duong-kho-qua-thi-chay-ve-khoc-voi-anh.jpg",
            audio: "audio/yeu-duong-kho-qua-thi-chay-ve-khoc-voi-anh.mp3",
            singer: "Erik"
        },
        {
            nameSong: "Sensitive-PM",
            img: "img/sensitive-pm.jpg",
            audio: "audio/sensitive-pm.mp3",
            singer: "LuHan"
        },
        {
            nameSong: "Super hero in my sleep",
            img: "img/superhero-in-my-sleep.jpg",
            audio: "audio/superhero-in-my-sleep.mp3",
            singer: "Rival x Asketa & Natan Chaim"
        },
    ],
    setInterface(key, value) {
        this.control[key] = value
        localStorage.setItem(CONTROL_SETTING_KEY, JSON.stringify(this.control))
    },
    getInterface(key) {
        if(this.control[key]) {
            this[key] = this.control[key]
        }
    },
    loadInterface() {
        this.getInterface('isRandom')
        this.getInterface('isRepeat')
        this.getInterface('songs')
        this.getInterface('currentIndex')
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    },
    defineProperties() {
        Object.defineProperty(this,'currentSong',{
            get(){
                return this.songs[this.currentIndex]
            }
        })
    },
    setId() {
        this.songs.forEach(function(song,index) {
            song.id = index
        })
    },
    setCurrentIndex(nameCurrent) {
        const _this = this
        this.songs.forEach(function(song) {
            if(song.nameSong === nameCurrent) {
                _this.currentIndex = song.id
            }
        })
    },
    render() {
        const htmls = this.songs.map((song,index) => `
        <div class="song ${index === this.currentIndex ? 'active' : ''}" data-id="${index}">
        <div class="thumb" style="background-image: url('${song.img}')">
        </div>
        <div class="body">
            <h3 class="title">${song.nameSong}</h3>
            <p class="author">${song.singer}</p>
        </div>
        <div class="option">
            <i class="fas fa-ellipsis-h"></i>
        </div>
        </div>
        `).join('')
        
        $('.playlist').innerHTML = htmls
    },
    handleEvents() {
        const cdWidth = cd.offsetWidth
        document.onscroll = function() {
            const scrollTop = window.scrollY
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth >= 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }
        playBtn.onclick = () => {
            if(this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }
        audio.onplay = () => {
            player.classList.add('playing')
            cdImg.style.animation = `spin 60s linear infinite`
            this.isPlaying = true
        }
        audio.onpause = () => {
            player.classList.remove('playing')
            cdImg.style.animationPlayState = "paused"
            this.isPlaying = false
        }
        progress.oninput = function() {
            const timePlay = audio.duration
            const seekTime = this.value*timePlay/1000
            audio.currentTime = seekTime
        }
        audio.ontimeupdate = () => {
            const timePlay = audio.duration
            const currentTime = audio.currentTime
            const watched = $('.watched')
            const currentPerThousand = currentTime*1000/timePlay
            const watchedWidth = currentPerThousand / 10
            if(timePlay){
                progress.value = currentPerThousand < 300 ? currentPerThousand - 10 : currentPerThousand > 680 ? currentPerThousand + 10 : currentPerThousand
                watched.style.width = watchedWidth + "%"
            }
        }
        nextBtn.onclick = () => {
            this.next()
            audio.play()
            this.activeCurrentSong()
            this.setInterface('currentIndex', this.currentIndex)
        }
        prevBtn.onclick = () => {
            this.prev()
            audio.play()
            this.activeCurrentSong()
            this.setInterface('currentIndex', this.currentIndex)
        }
        randomBtn.onclick = () => {
            this.isRandom = !this.isRandom
            this.setInterface('isRandom', this.isRandom)
            randomBtn.classList.toggle('active', this.isRandom)
            this.random()
            this.render()
            this.setInterface('songs', this.songs)
            this.setInterface('currentIndex', this.currentIndex)
        }
        repeatBtn.onclick = () => {
            this.isRepeat = !this.isRepeat
            this.setInterface('isRepeat', this.isRepeat)
            repeatBtn.classList.toggle('active', this.isRepeat)
        }
        audio.onended = () => {
            if(this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }
        playlist.onclick = (e) => {
            const _this = this
            const song = e.target.closest('.song')
            const option = e.target.closest('.option')
            if(song && !e.target.closest('.song.active') || option){
                if(option) {
                    //...
                } else {
                    $('.song.active').classList.remove('active')
                    song.classList.add('active')
                    _this.currentIndex = song.dataset.id
                    _this.loadCurrentSong()
                    audio.play()
                }
            }
        }
    },
    loadCurrentSong() {
        heading.textContent = this.currentSong.nameSong
        cdImg.style.backgroundImage = `url("${this.currentSong.img}")`
        audio.src = this.currentSong.audio
    },
    next() {
        this.currentIndex++
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0
        }
        this.loadCurrentSong()
        this.scrollToActive()
    },
    prev() {
            this.currentIndex--
            if(this.currentIndex < 0){
                this.currentIndex = this.songs.length - 1
            }
        this.loadCurrentSong()
        this.scrollToActive()
    },
    sort(){
        this.songs.sort(function(a,b) {
            const nameA = a.nameSong.toUpperCase()
            const nameB = b.nameSong.toUpperCase()
            return nameA > nameB ? 1 : -1
        })
    },
    random() {
        if(this.isRandom){
            const nameCurrent = this.currentSong.nameSong
            let currentIndex = this.songs.length
            let randomIndex 
            let temporaryVariable
            while (currentIndex > 0) {
                currentIndex --
                randomIndex = Math.floor(Math.random()*currentIndex)
                temporaryVariable = this.songs[randomIndex]
                this.songs[randomIndex] = this.songs[currentIndex]
                this.songs[currentIndex] = temporaryVariable
            }
            this.setId()
            this.setCurrentIndex(nameCurrent)
        } else {
            const nameCurrent = this.currentSong.nameSong
            this.sort()
            this.setId()
            this.setCurrentIndex(nameCurrent)
        }
    },
    activeCurrentSong() {
        const _this = this
        $('.song.active').classList.remove('active')
        $$('.song').forEach(function(song){
            if(+song.dataset.id === _this.currentIndex){
                song.classList.add('active')
            }            
        })
    },
    scrollToActive() {
        const currentIndex = this.currentIndex
        if(currentIndex === 0) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            })
         } else {
                window.scrollTo({
                    top: 200 + 80*(currentIndex - 1),
                    behavior: 'smooth'
                })
            }
    },
    start() {
        this.sort()
        // Thêm id cho từng bài hát sau khi sắp xếp
        this.setId()
        // Load giao diện
        this.loadInterface()
        // Sắp xếp danh sách nhạc
        // Định nghĩa các thuộc tính
        this.defineProperties()
        // Tải bài nhạc đầu tiên khi load web
        this.loadCurrentSong(this)
        // Render dữ liệu
        this.render()
        // Lắng nghe sự kiện
        this.handleEvents()
    }
}

app.start()