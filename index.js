// ============================================================
// DATA LAYER — API calls to backend
// ============================================================

const API_BASE = 'https://shruti-birthday-backend.onrender.com/api'; // replace with your Render URL

const DataStore = {
    // Leaderboard
    async getLeaderboard() {
        try {
            const res = await fetch(`${API_BASE}/leaderboard`);
            return await res.json();
        } catch { return []; }
    },
    async addLeaderboardEntry(playerName, score) {
        try {
            await fetch(`${API_BASE}/leaderboard`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerName, score })
            });
        } catch (err) { console.error('Failed to save score:', err); }
    },

    // Wishes
    async getWishes() {
        try {
            const res = await fetch(`${API_BASE}/wishes`);
            return await res.json();
        } catch { return []; }
    },
    async addWish(name, message) {
        try {
            await fetch(`${API_BASE}/wishes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, message })
            });
        } catch (err) { console.error('Failed to save wish:', err); }
    },

    // Hunt
    async addHuntEntry(hunter, items) {
        try {
            await fetch(`${API_BASE}/hunt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hunter, items })
            });
        } catch (err) { console.error('Failed to save hunt entry:', err); }
    },
    async getHuntEntries(pin) {
        try {
            const res = await fetch(`${API_BASE}/hunt`, {
                headers: { 'x-host-pin': pin }
            });
            if (!res.ok) return null;
            return await res.json();
        } catch { return null; }
    }
};


// ============================================================
// GALLERY CAROUSEL (2 per view, IG-height)
// ============================================================

const galleryImages = [
    './images/image1.jpeg',
    './images/image2.jpeg',
    './images/image3.jpeg',
    './images/image4.jpeg',
    './images/image5.jpeg',
    './images/image6.jpeg',
    './images/image7.jpeg',
    './images/image8.jpeg',
];

// Shuffle gallery images
function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Group images into pairs
function chunkArray(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

const gallerySlides = chunkArray(shuffleArray(galleryImages), 2);

function createCarousel(trackEl, dotsEl, prevBtn, nextBtn, renderSlide, items) {
    let current = 0;

    function render() {
        trackEl.innerHTML = '';
        items.forEach((item, i) => {
            const slide = document.createElement('div');
            slide.className = 'w-full flex-shrink-0';
            slide.style.minWidth = '100%';
            renderSlide(slide, item, i);
            trackEl.appendChild(slide);
        });
        updatePosition();
        renderDots();
    }

    function updatePosition() {
        trackEl.style.transform = `translateX(-${current * 100}%)`;
    }

    function renderDots() {
        dotsEl.innerHTML = '';
        items.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = `carousel-dot${i === current ? ' active' : ''}`;
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.onclick = () => { current = i; updatePosition(); renderDots(); };
            dotsEl.appendChild(dot);
        });
    }

    function next() {
        current = (current + 1) % items.length;
        updatePosition();
        renderDots();
    }

    function prev() {
        current = (current - 1 + items.length) % items.length;
        updatePosition();
        renderDots();
    }

    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);

    // Swipe support
    let startX = 0;
    trackEl.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; });
    trackEl.addEventListener('touchend', (e) => {
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); }
    });

    return { render, next, prev, refresh(newItems) { items = newItems; current = 0; render(); } };
}

// Init gallery carousel
const galleryCarousel = createCarousel(
    document.getElementById('gallery-track'),
    document.getElementById('gallery-dots'),
    document.getElementById('gallery-prev'),
    document.getElementById('gallery-next'),
    (slide, pair) => {
        const grid = pair.map(src => `
            <div class="bg-white p-2 rounded-2xl shadow-lg overflow-hidden">
                <img src="${src}" alt="Memory" class="w-full h-full object-cover rounded-xl">
            </div>
        `).join('');
        slide.innerHTML = `
            <div class="px-4">
                <div class="grid grid-cols-2 gap-4 gallery-grid">
                    ${grid}
                </div>
            </div>`;
    },
    gallerySlides
);
galleryCarousel.render();


// ============================================================
// WISHES CAROUSEL
// ============================================================

async function renderWishesCarousel() {
    const wishes = await DataStore.getWishes();
    const track = document.getElementById('wishes-track');
    const dots = document.getElementById('wishes-dots');
    const prevBtn = document.getElementById('wishes-prev');
    const nextBtn = document.getElementById('wishes-next');

    if (wishes.length === 0) {
        track.innerHTML = '<div class="w-full flex-shrink-0 text-center py-12 text-slate-400 italic" style="min-width:100%">No wishes yet. Be the first!</div>';
        dots.innerHTML = '';
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        return;
    }

    prevBtn.style.display = 'flex';
    nextBtn.style.display = 'flex';

    if (!window._wishesCarousel) {
        window._wishesCarousel = createCarousel(track, dots, prevBtn, nextBtn,
            (slide, wish) => {
                slide.innerHTML = `
                    <div class="px-4">
                        <div class="bg-white p-8 rounded-[2rem] shadow-xl border-l-8 border-rose-400">
                            <p class="text-slate-700 italic mb-3 text-lg">"${wish.message}"</p>
                            <p class="text-sm font-bold text-rose-500 uppercase tracking-widest">— ${wish.name}</p>
                        </div>
                    </div>`;
            },
            [...wishes]
        );
        window._wishesCarousel.render();
    } else {
        window._wishesCarousel.refresh([...wishes]);
    }
}

renderWishesCarousel();


// ============================================================
// CAKE / CANDLES
// ============================================================

document.querySelectorAll('.flame').forEach(flame => {
    flame.addEventListener('click', () => {
        if (!flame.classList.contains('blown-out')) {
            flame.classList.add('blown-out');
            if (document.querySelectorAll('.flame.blown-out').length === 3) {
                document.getElementById('wish-message').classList.remove('hidden');
                confetti({ particleCount: 200, origin: { y: 0.6 } });
            }
        }
    });
});

document.getElementById('relight-btn').addEventListener('click', () => {
    document.querySelectorAll('.flame').forEach(f => f.classList.remove('blown-out'));
    document.getElementById('wish-message').classList.add('hidden');
});


// ============================================================
// QUIZ
// ============================================================

const quizData = [
    { q: "What is Shruti's absolute favorite color?", o: ["Blue", "Red", "Pink", "Green"], a: 2 },
    { q: "Which fruit does Shruti love the most?", o: ["Mango", "Apple", "Watermelon", "Grapes"], a: 2 },
    { q: "Where did Shruti complete her Master's degree?", o: ["Trine University", "Boston University", "Northeastern University", "NYU"], a: 2 },
    { q: "Which city was Shruti born in?", o: ["Pune", "Mumbai", "Delhi", "Bangalore"], a: 1 },
    { q: "Who is Shruti's favorite Bollywood celebrity?", o: ["Ranbir Kapoor", "Ranveer Singh", "Shah Rukh Khan", "Varun Dhawan"], a: 1 },
    { q: "Which is Shruti's favorite cuisine?", o: ["Italian", "Chinese", "Mexican", "Indian"], a: 3 },
    { q: "Is Shruti a morning bird or a night owl?", o: ["Early Bird", "Night Owl", "Always Napping", "Just Tired"], a: 1 },
    { q: "What is Shruti's favorite season?", o: ["Summer", "Monsoon", "Winter", "Spring"], a: 2 },
    { q: "What type of pet does Shruti want?", o: ["Dog", "Cat", "Hamster", "Rabbit"], a: 1 },
    { q: "Who is Shruti's favorite person in the whole world?", o: ["Siddhesh", "Siddhesh", "Siddhesh", "Siddhesh"], a: -1 }
];

let curQ = 0, curScore = 0, currentPlayer = '';

function renderQuestion() {
    const q = quizData[curQ];
    document.getElementById('q-num').innerText = curQ + 1;
    document.getElementById('q-text').innerText = q.q;
    document.getElementById('progress-bar').style.width = ((curQ + 1) * 10) + '%';

    const box = document.getElementById('options-box');
    box.innerHTML = '';

    q.o.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-option w-full text-left p-5 rounded-2xl border-2 border-slate-50 font-bold text-slate-700';
        btn.innerText = opt;
        btn.addEventListener('click', () => handleAnswer(i));
        box.appendChild(btn);
    });
}

function handleAnswer(selected) {
    const q = quizData[curQ];
    const buttons = document.querySelectorAll('#options-box .quiz-option');

    // Highlight correct/wrong
    buttons.forEach((btn, i) => {
        btn.style.pointerEvents = 'none';
        if (q.a === -1 || i === q.a) btn.classList.add('correct');
        else if (i === selected && i !== q.a) btn.classList.add('wrong');
    });

    if (q.a === -1 || selected === q.a) curScore++;

    // Brief pause then advance
    setTimeout(() => {
        curQ++;
        if (curQ < quizData.length) {
            renderQuestion();
        } else {
            showResult();
        }
    }, 600);
}

async function showResult() {
    document.getElementById('question-box').classList.add('hidden');
    document.getElementById('result-box').classList.remove('hidden');
    document.getElementById('final-score').innerText = curScore;

    const msg = document.getElementById('result-msg');
    const gift = document.getElementById('surprise-gift-quiz');

    if (curScore === 10) {
        msg.innerText = '';
        gift.classList.remove('hidden');
        confetti({ particleCount: 150 });
    } else if (curScore >= 7) {
        msg.innerText = "So close! You really know Shruti well!";
        gift.classList.add('hidden');
    } else {
        msg.innerText = "You need to spend more time with her!";
        gift.classList.add('hidden');
    }

    await DataStore.addLeaderboardEntry(currentPlayer, curScore);
    await renderLeaderboard();
}

async function renderLeaderboard() {
    const lb = document.getElementById('quiz-leaderboard');
    const results = await DataStore.getLeaderboard();

    if (results.length === 0) {
        lb.innerHTML = '<p class="text-center text-slate-400 italic">No results yet. Be the first!</p>';
        return;
    }

    lb.innerHTML = results.map((r, idx) => {
        const icon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
        return `<div class="flex justify-between items-center p-4 rounded-2xl border bg-white shadow-sm">
            <div class="flex items-center space-x-4">
                <span class="w-8 font-bold">${icon}</span>
                <span class="font-semibold">${r.playerName}</span>
            </div>
            <span class="font-mono font-bold text-rose-600">${r.score}/10</span>
        </div>`;
    }).join('');
}

document.getElementById('start-quiz-btn').addEventListener('click', () => {
    currentPlayer = document.getElementById('quiz-player-name').value.trim();
    if (!currentPlayer) { alert('Enter your name!'); return; }
    document.getElementById('quiz-intro').classList.add('hidden');
    document.getElementById('question-box').classList.remove('hidden');
    curQ = 0;
    curScore = 0;
    renderQuestion();
});

document.getElementById('play-again-btn').addEventListener('click', () => {
    document.getElementById('result-box').classList.add('hidden');
    document.getElementById('surprise-gift-quiz').classList.add('hidden');
    document.getElementById('quiz-intro').classList.remove('hidden');
    document.getElementById('quiz-player-name').value = '';
});

// Load leaderboard on page load
renderLeaderboard();


// ============================================================
// SCAVENGER HUNT
// ============================================================

const huntInputs = document.getElementById('hunt-inputs');
for (let i = 1; i <= 10; i++) {
    huntInputs.innerHTML += `
        <div class="space-y-2">
            <span class="text-xs text-slate-500 font-bold uppercase">Item #${i}</span>
            <input id="hunt-q-${i}" required class="w-full p-4 rounded-xl bg-black border border-slate-700 text-white">
        </div>`;
}

document.getElementById('hunt-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const hunterName = document.getElementById('hunter-name').value.trim();
    if (!hunterName) { alert('Enter your name!'); return; }

    const items = {};
    for (let i = 1; i <= 10; i++) {
        items[`Item ${i}`] = document.getElementById(`hunt-q-${i}`).value.trim();
    }

    await DataStore.addHuntEntry(hunterName, items);
    document.getElementById('hunt-form-container').classList.add('hidden');
    document.getElementById('hunt-success').classList.remove('hidden');
    confetti({ particleCount: 100 });
});

document.getElementById('hunt-again-btn').addEventListener('click', () => {
    // Reset form fields
    document.getElementById('hunter-name').value = '';
    for (let i = 1; i <= 10; i++) {
        document.getElementById(`hunt-q-${i}`).value = '';
    }
    // Swap visibility back
    document.getElementById('hunt-success').classList.add('hidden');
    document.getElementById('hunt-form-container').classList.remove('hidden');
});


// ============================================================
// BIRTHDAY WISHES
// ============================================================

document.getElementById('post-wish-btn').addEventListener('click', async () => {
    const name = document.getElementById('guest-name').value.trim();
    const msg = document.getElementById('guest-msg').value.trim();
    if (!name || !msg) { alert('Please fill in both fields!'); return; }

    await DataStore.addWish(name, msg);
    document.getElementById('guest-name').value = '';
    document.getElementById('guest-msg').value = '';
    await renderWishesCarousel();
});


// ============================================================
// HOST DASHBOARD
// ============================================================

document.getElementById('unlock-btn').addEventListener('click', async () => {
    const pin = document.getElementById('host-pin').value;
    const entries = await DataStore.getHuntEntries(pin);

    if (entries === null) {
        alert('Incorrect PIN');
        return;
    }

    document.getElementById('host-auth').classList.add('hidden');
    document.getElementById('host-view').classList.remove('hidden');

    const list = document.getElementById('hunt-submissions-list');
    if (entries.length === 0) {
        list.innerHTML = '<p class="text-slate-500 italic col-span-2 text-center">No submissions yet.</p>';
        return;
    }

    list.innerHTML = entries.map(entry => {
        const items = entry.items instanceof Object ? entry.items : {};
        const itemsHtml = Object.entries(items)
            .map(([key, val]) => `<div class="bg-slate-800 p-2 rounded">${key}: ${val || '---'}</div>`)
            .join('');
        return `<div class="bg-slate-900 p-6 rounded-3xl border border-slate-700 shadow-xl">
            <div class="font-bold text-indigo-400 text-lg uppercase">${entry.hunter}</div>
            <div class="grid grid-cols-1 gap-1 text-sm text-slate-400 mt-4 border-t border-slate-800 pt-4">${itemsHtml}</div>
        </div>`;
    }).join('');
});

document.getElementById('lock-btn').addEventListener('click', () => {
    document.getElementById('host-auth').classList.remove('hidden');
    document.getElementById('host-view').classList.add('hidden');
    document.getElementById('host-pin').value = '';
});


// ============================================================
// MOBILE NAV
// ============================================================

document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.toggle('hidden');
});

// Close mobile menu when a link is clicked
document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('mobile-menu').classList.add('hidden');
    });
});