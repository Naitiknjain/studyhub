// ============================================
// STEP 1 — Connect to Supabase
// ============================================

const SUPABASE_URL = 'https://bnbdbrtwlqguidqwxynt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuYmRicnR3bHFndWlkcXd4eW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MDUzMjUsImV4cCI6MjA5MjE4MTMyNX0.LNsKcPdNrFhD9Fl6St7uuLB41uHNbgiBvOnmeBxGqJE'

const { createClient } = supabase
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)


// ============================================
// STEP 2 — Figure out subject from URL
// ============================================

function getSubjectFromURL() {
  // Get the current page filename
  // e.g. "subject.html" or "amiv.html"
  const page = window.location.pathname
    .split('/')
    .pop()
    .toLowerCase()

  // Map filename to subject name
  if (page === 'subject.html') return 'oslab'
  if (page === 'amiv.html')    return 'amiv'

  // Default fallback
  return 'oslab'
}


// ============================================
// STEP 3 — Load Videos
// ============================================

const videosGrid = document.getElementById('videos-grid')

if (videosGrid) {
  loadVideos()
}

async function loadVideos() {

  // Get subject directly from URL — 100% reliable!
  const subject = getSubjectFromURL()

  // Fetch videos for this subject only
  const { data: videos, error } = await db
    .from('videos')
    .select('*')
    .eq('subject', subject)

  if (error) {
    videosGrid.innerHTML = `
      <p style="color: red; text-align: center;">
        Error loading videos. Please try again later.
      </p>`
    return
  }

  if (videos.length === 0) {
    videosGrid.innerHTML = `
      <p style="color: #888; text-align: center;">
        No videos added yet. Check back soon!
      </p>`
    return
  }

  videosGrid.innerHTML = ''

  videos.forEach(video => {
    const card = document.createElement('div')
    card.className = 'video-card'

    card.innerHTML = `
      <div class="video-thumbnail" onclick="playVideo(this, '${video.video_url}')">
        <img
          src="${video.thumbnail_url}"
          alt="${video.title}"
        />
        <div class="play-button">▶</div>
      </div>

      <div class="video-info">
        <h3>${video.title}</h3>
        <p>${video.description}</p>
      </div>

      <div class="feedback-form">
        <p>💬 Leave Feedback</p>
        <input
          type="text"
          id="feedback-${video.id}"
          placeholder="Was this helpful? Let us know..."
        />
        <br/>
        <button
          class="btn-submit"
          onclick="submitFeedback(${video.id})">
          Submit
        </button>
        <p class="feedback-msg" id="feedback-msg-${video.id}"></p>
      </div>
    `

    videosGrid.appendChild(card)
  })
}


// ============================================
// STEP 4 — Submit Feedback
// ============================================

async function submitFeedback(videoId) {

  const input = document.getElementById(`feedback-${videoId}`)
  const message = input.value.trim()
  const msgEl = document.getElementById(`feedback-msg-${videoId}`)

  if (!message) {
    msgEl.style.color = '#f44336'
    msgEl.textContent = 'Please write something before submitting!'
    return
  }

  msgEl.style.color = '#aaa'
  msgEl.textContent = 'Saving...'

  const { error } = await db
    .from('feedback')
    .insert([{
      video_id: videoId,
      message: message
    }])

  if (error) {
    msgEl.style.color = '#f44336'
    msgEl.textContent = 'Something went wrong. Please try again.'
    return
  }

  input.value = ''
  msgEl.style.color = '#4caf50'
  msgEl.textContent = '✅ Feedback submitted! Thank you!'

  setTimeout(() => {
    msgEl.textContent = ''
  }, 4000)
}


// ============================================
// STEP 5 — Submit Doubt
// ============================================

async function submitDoubt() {

  const name = document.getElementById('doubt-name').value.trim()
  const email = document.getElementById('doubt-email').value.trim()
  const message = document.getElementById('doubt-message').value.trim()
  const msgEl = document.getElementById('doubt-msg')

  if (!name || !email || !message) {
    msgEl.style.color = '#f44336'
    msgEl.textContent = 'Please fill in all fields!'
    return
  }

  msgEl.style.color = '#aaa'
  msgEl.textContent = 'Submitting...'

  const { error } = await db
    .from('doubts')
    .insert([{
      name: name,
      email: email,
      message: message
    }])

  if (error) {
    msgEl.style.color = '#f44336'
    msgEl.textContent = 'Something went wrong. Please try again.'
    return
  }

  document.getElementById('doubt-name').value = ''
  document.getElementById('doubt-email').value = ''
  document.getElementById('doubt-message').value = ''

  msgEl.style.color = '#4caf50'
  msgEl.textContent = '✅ Doubt submitted! We will get back to you soon.'

  setTimeout(() => {
    msgEl.textContent = ''
  }, 5000)
}


// ============================================
// Helper — Play video on click
// ============================================

function getYoutubeId(url) {
  const parts = url.split('/')
  return parts[parts.length - 1]
}

function playVideo(thumbnailDiv, videoUrl) {
  const iframe = document.createElement('iframe')
  // YouTube gets autoplay, all other links stay as-is
  const src = videoUrl.includes('youtube.com')
    ? videoUrl + '?autoplay=1'
    : videoUrl
  iframe.src = src
  iframe.title = 'Video Player'
  iframe.allowFullscreen = true
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
  iframe.style.width = '100%'
  iframe.style.height = '200px'
  iframe.style.border = 'none'
  iframe.style.display = 'block'
  thumbnailDiv.replaceWith(iframe)
}
