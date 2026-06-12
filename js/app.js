/**
 * 자취닥터 (Holo-Yak) - 핵심 비즈니스 로직 및 인터랙션 스크립트
 * 12대 요구사항 및 백엔드(Firebase) 연동 통합 구현
 */

// ==========================================
// [Firebase 설정 및 초기화]
// ==========================================
// index.html에서 이미 진짜 정보로 초기화했으므로, 여기서는 연동만 해줍니다!
let db = null;
let isFirebaseConnected = false;

function connectFirebase() {
  try {
    if (typeof firebase !== 'undefined') {
      db = firebase.database();
      isFirebaseConnected = true;
      console.log("자취닥터 파이어베이스 실시간 연동 완벽 성공! 🚀");
    } else {
      console.warn("Firebase 라이브러리가 로드되지 않았습니다. 시뮬레이션 모드로 작동합니다.");
    }
  } catch (error) {
    console.warn("Firebase 연결 실패. 시뮬레이션 모드로 작동합니다.", error);
  }
}
const symptomData = [
  {
    id: "fever",
    name: "새벽고열",
    choseong: "ㅅㅂㄱㅇ ㄱㅇ ㅇ",
    keywords: ["고열", "열", "발열", "해열", "감기", "몸살", "추위", "오한"],
    category: "fever",
    medicine: {
      name: "타이레놀정 500mg",
      price: "3,000원",
      type: "convenience", // 편의점 상비약
      typeText: "편의점 상비약"
    },
    location: {
      store: "GS25 자취촌중앙점",
      dist: "도보 3분 (180m)",
      hours: "24시간 영업 (연중무휴)",
      allNightPharmacy: "대학가 온누리 야간약국 (도보 12분, 24시 운영)"
    },
    relatedDisease: {
      name: "급성 신우신염",
      warning: "단순 고열이 아닌 옆구리 통증이나 오한이 동반될 경우, 급성 신우신염일 가능성이 높으니 즉시 응급실로 가야 합니다."
    }
  },
  {
    id: "headache",
    name: "극심한두통",
    choseong: "ㄱㅅㅎㄷㅌ ㄷㅌ",
    keywords: ["두통", "머리", "편두통", "통증", "어지러움", "스트레스"],
    category: "headache",
    medicine: {
      name: "탁센 연질캡슐",
      price: "3,500원",
      type: "pharmacy", // 약국 전용
      typeText: "약국 전용 약"
    },
    location: {
      store: "CU 대학가점",
      dist: "도보 5분 (300m) - 상비약(타이레놀)만 판매",
      hours: "24시간 영업 (연중무휴)",
      allNightPharmacy: "정문 정문약국 (도보 8분, 평일 09:00 - 21:00)"
    },
    relatedDisease: {
      name: "뇌수막염 / 뇌졸중",
      warning: "망치로 때리는 듯한 극심한 두통과 함께 목이 뻣뻣해지거나 구토가 난다면 단순 두통이 아닌 뇌질환 응급 신호입니다."
    }
  },
  {
    id: "indigestion",
    name: "급체/장염",
    choseong: "ㄱㅊ ㅈㅇ ㅅㅎㅂㄹ",
    keywords: ["체함", "급체", "소화불량", "배탈", "설사", "장염", "복통", "구토"],
    category: "stomach",
    medicine: {
      name: "훼스탈 플러스정",
      price: "2,800원",
      type: "convenience",
      typeText: "편의점 상비약"
    },
    location: {
      store: "GS25 원룸타운점",
      dist: "도보 2분 (120m)",
      hours: "24시간 영업",
      allNightPharmacy: "자취가 열린약국 (도보 15분, 평일 09:00 - 19:00)"
    },
    relatedDisease: {
      name: "급성 충수염 (맹장염)",
      warning: "명치 부근에서 시작된 통증이 오른쪽 아래 배로 이동한다면 장염이 아닌 맹장염일 수 있으므로 손으로 누를 때 아프면 즉시 내원하세요."
    }
  },
  {
    id: "muscle",
    name: "근육통/염좌",
    choseong: "ㄱㅇㅌ ㅇㅈ ㅍㅅ",
    keywords: ["근육통", "염좌", "파스", "삠", "담", "어깨", "허리통증", "관절"],
    category: "muscle",
    medicine: {
      name: "제일쿨파프 5매",
      price: "2,500원",
      type: "convenience",
      typeText: "편의점 상비약"
    },
    location: {
      store: "CU 자취타운점",
      dist: "도보 4분 (240m)",
      hours: "24시간 영업",
      allNightPharmacy: "푸른 온누리약국 (도보 7분, 평일 09:00 - 20:00)"
    },
    relatedDisease: {
      name: "디스크 파열 / 인대 파열",
      warning: "단순 통증을 넘어 다리나 팔 저림이 동반되거나 관절을 아예 움직일 수 없을 때는 뼈와 인대 손상 정밀 검사가 필수적입니다."
    }
  },
  {
    id: "throat",
    name: "목통증/인후염",
    choseong: "ㅁㅌㅈ ㅇㅎㅇ ㄱㄱ",
    keywords: ["목통증", "목아픔", "인후염", "기침", "목감기", "가래", "편도"],
    category: "throat",
    medicine: {
      name: "스트렙실 허니앤레몬",
      price: "4,200원",
      type: "pharmacy",
      typeText: "약국 전용 약"
    },
    location: {
      store: "GS25 학사로점 - 상비약 없음",
      dist: "도보 6분 (360m)",
      hours: "24시간 영업",
      allNightPharmacy: "중앙 메디컬약국 (도보 10분, 평일 09:00 - 22:00)"
    },
    relatedDisease: {
      name: "역류성 식도염",
      warning: "목에 이물감이 지속되고 신물이 넘어오며 밤에 기침이 심해진다면, 감기가 아닌 위산 역류성 식도염일 수 있습니다."
    }
  }
];

// ==========================================
// [상태 관리 변수]
// ==========================================
let currentSearchQuery = "";
let forceNightMode = false; // 테스트용 야간 모드 강제 토글 상태
let simulatedStock = 0; // 로컬 테스트용 서랍 약 재고 수치

// ==========================================
// [앱 초기 실행 로직]
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  connectFirebase(); 
  initRealtimeClock();
  initDoseTimer();
  initFirebaseStock();
  setupEventListeners();
  renderSymptoms();
});

// ==========================================
// [1] 실시간 시계 초기화
// ==========================================
function initRealtimeClock() {
  const clockBadge = document.getElementById("currentTimeBadge");
  const updateClock = () => {
    const now = new Date();
    const formatted = now.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    clockBadge.textContent = `현재시각: ${formatted}`;
  };
  updateClock();
  setInterval(updateClock, 1000);
}

// ==========================================
// [2] 이벤트 리스너 바인딩
// ==========================================
function setupEventListeners() {
  // 실시간 검색 기능 연동
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", (e) => {
    currentSearchQuery = e.target.value.trim().toLowerCase();
    renderSymptoms();
  });

  // 상단 퀵 증상 바로가기 버튼 기능 연동
  const quickBtns = document.querySelectorAll(".quick-btn");
  quickBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetSymptom = btn.dataset.symptom;
      searchInput.value = targetSymptom;
      currentSearchQuery = targetSymptom.toLowerCase();
      renderSymptoms();
    });
  });

  // 강제 야간 모드 토글
  const nightToggle = document.getElementById("nightToggle");
  nightToggle.addEventListener("change", (e) => {
    forceNightMode = e.target.checked;
    renderSymptoms();
  });

  // [복약 안심 타이머] 버튼 등록
  const takeDoseBtn = document.getElementById("takeDoseBtn");
  takeDoseBtn.addEventListener("click", () => {
    recordDoseTaken();
  });

  // [Firebase 시뮬레이터] 수동 조작용 버튼
  const btnStockEmpty = document.getElementById("btnStockEmpty");
  const btnStockAvailable = document.getElementById("btnStockAvailable");

  if (btnStockEmpty && btnStockAvailable) {
    btnStockEmpty.addEventListener("click", () => {
      updateStockData(0);
    });
    btnStockAvailable.addEventListener("click", () => {
      updateStockData(1);
    });
  }
}

// ==========================================
// [3] 증상 및 약국 필터링 & 렌더링 핵심 로직
// ==========================================
function renderSymptoms() {
  const symptomListContainer = document.getElementById("symptomList");
  symptomListContainer.innerHTML = "";

  // [8] 현재 영업 시간 필터 상태 확인 (21:00 ~ 09:00 인지 여부)
  const currentHour = new Date().getHours();
  const isNightTime = forceNightMode || (currentHour >= 21 || currentHour < 9);

  // 1. 검색어 매칭 필터링
  let filtered = symptomData.filter(item => {
    if (!currentSearchQuery) return true;
    
    // 초성 검색 매칭
    const matchesChoseong = item.choseong.includes(currentSearchQuery);
    // 키워드 및 한글 매칭
    const matchesName = item.name.toLowerCase().includes(currentSearchQuery);
    const matchesKeyword = item.keywords.some(k => k.includes(currentSearchQuery));
    const matchesMedicine = item.medicine.name.toLowerCase().includes(currentSearchQuery);

    return matchesChoseong || matchesName || matchesKeyword || matchesMedicine;
  });

  // 2. [8] 밤 9시 ~ 아침 9시 사이 정렬 규칙 적용: 편의점(convenience)을 최상단으로 우선 정렬
  if (isNightTime) {
    filtered.sort((a, b) => {
      const typeA = a.medicine.type === "convenience" ? 0 : 1;
      const typeB = b.medicine.type === "convenience" ? 0 : 1;
      return typeA - typeB; // 편의점(0)이 우선 순위로 올라옴
    });
  }

  // 3. 카드 DOM 동적 생성
  filtered.forEach(item => {
    const card = document.createElement("div");
    card.className = "symptom-card";
    
    // [8] 밤 9시 ~ 아침 9시 사이 일반 약국 투명도 0.4 처리 적용
    const isClosedPharmacy = isNightTime && item.medicine.type === "pharmacy";
    if (isClosedPharmacy) {
      card.classList.add("pharmacy-closed");
    }

    // 약 정보 태그 스타일 결정
    let tagClass = "tag-convenience";
    if (item.medicine.type === "pharmacy") tagClass = "tag-pharmacy";
    if (item.medicine.type === "allnight") tagClass = "tag-allnight";

    card.innerHTML = `
      <div>
        <div class="card-header">
          <span class="symptom-tag-pill ${tagClass}">${item.medicine.typeText}</span>
          ${isClosedPharmacy ? '<span class="location-hours" style="background:#fce8e6; color:#a83232;">현재 시간 약국 폐점</span>' : ''}
        </div>
        <h3 class="symptom-name">${item.name}</h3>
        
        <div class="medicine-info" style="margin-top: 10px;">
          <span class="medicine-name">💊 ${item.medicine.name}</span>
          <span class="medicine-price">${item.medicine.price}</span>
        </div>

        <div class="location-mapping" style="margin-top: 14px;">
          <div class="location-title">📍 도보 가장 가까운 곳</div>
          <div class="location-detail">
            <span>${item.location.store}</span>
            <span class="location-dist">${item.location.dist}</span>
          </div>
          <div class="location-hours">${item.location.hours}</div>
          
          <div class="location-title" style="margin-top: 8px;">🏥 야간 비상 수단</div>
          <div class="location-detail" style="font-size:0.8rem; color:var(--text-muted);">
            <span>${item.location.allNightPharmacy}</span>
          </div>
        </div>
      </div>

      <div class="card-actions">
        <button class="copy-memo-btn" onclick="copySymptomMemo('${item.name}', '${item.medicine.name}')">
          📋 의사쌤한테 이대로 보여줘
        </button>
      </div>
    `;

    symptomListContainer.appendChild(card);
  });

  // 매칭되는 결과가 없을 때 예외 뷰
  if (filtered.length === 0) {
    symptomListContainer.innerHTML = `
      <div style="text-align:center; padding: 40px; color: var(--text-muted); background: white; border-radius:16px; border:1px solid var(--border-color); width:100%;">
        🔍 찾으시는 증상이 없습니다.<br>
        <span style="font-size:0.8rem; display:block; margin-top:8px;">초성(예: ㄷㅌ, ㄱㅇ)이나 키워드를 올바르게 입력해 주세요.</span>
      </div>
    `;
  }
}

// ==========================================
// [4] 파이어베이스 실시간 재고 연동 및 시뮬레이터
// ==========================================
function initFirebaseStock() {
  const stockContainer = document.getElementById("stockContainer");
  const stockTitle = document.getElementById("stockTitle");
  const stockDesc = document.getElementById("stockDesc");

  const updateUI = (stockCount) => {
    simulatedStock = stockCount;
    // UI 클래스 리셋
    stockContainer.className = "stock-panel";

    if (stockCount >= 1) {
      stockContainer.classList.add("stock-available");
      stockTitle.innerHTML = "🟢 내 서랍 상비약 : 여유 있음";
      stockDesc.innerHTML = "<strong>서랍에 상비약이 있으니 무리해서 밖으로 나가지 마세요!</strong>";
    } else {
      stockContainer.classList.add("stock-empty");
      stockTitle.innerHTML = "🔴 내 서랍 상비약 : 재고 없음";
      stockDesc.innerHTML = "<strong>서랍에 약이 없습니다. 도보 거리 내 편의점에서 상비약을 구입해 주세요.</strong>";
    }
  };

  // Firebase Realtime DB가 연동되어 있을 경우 구독 처리
  if (isFirebaseConnected && db) {
    const drawerRef = db.ref('my_room_drawer');
    drawerRef.on('value', (snapshot) => {
      const data = snapshot.val();
      const count = (data !== null) ? Number(data) : 0;
      updateUI(count);
    }, (error) => {
      console.warn("Firebase 읽기 실패, 시뮬레이터 모드를 유지합니다.", error);
      updateUI(simulatedStock);
    });
  } else {
    // Firebase 연결이 없을 시 기본값 0(없음)으로 초기 로컬 세팅
    updateUI(simulatedStock);
  }
}

// Firebase 또는 로컬 시뮬레이터 재고 수정 요청 함수
function updateStockData(count) {
  if (isFirebaseConnected && db) {
    db.ref('my_room_drawer').set(count)
      .then(() => {
        console.log("Firebase DB 재고 반영 성공");
      })
      .catch((err) => {
        console.error("Firebase DB 반영 실패 (시뮬레이터 반영)", err);
        // Fallback
        simulatedStock = count;
        initFirebaseStock();
      });
  } else {
    simulatedStock = count;
    initFirebaseStock();
  }
}

// ==========================================
// [9] "의사쌤한테 이대로 보여줘" 증상 메모 복사 로직
// ==========================================
window.copySymptomMemo = function(symptomName, medicineName) {
  const now = new Date();
  const dateStr = `${now.getMonth() + 1}월 ${now.getDate()}일`;
  
  // 타이머에서 최근 복용한 내역이 있는지 대조
  const lastDoseTime = localStorage.getItem("lastDoseTime");
  let doseMemo = "아직 약을 복용하지 않았거나 기록이 없습니다.";
  
  if (lastDoseTime) {
    const diffMs = now.getTime() - Number(lastDoseTime);
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours === 0) {
      doseMemo = `${diffMins}분 전 ${medicineName}을(를) 복용했으나`;
    } else {
      doseMemo = `${diffHours}시간 ${diffMins}분 전 ${medicineName}을(를) 복용했으나`;
    }
  } else {
    // 기본 디폴트 문장 대응 (2시간 전 복용으로 프리셋 제공)
    doseMemo = `2시간 전 ${medicineName} 1정을 복용했으나`;
  }

  // 복사할 문장 구성
  const completeSentence = `${dateStr} 발생한 [${symptomName}] 증상입니다. ${doseMemo} 증상이 지속되어 내원했습니다.`;

  // 클립보드 복사 실행
  navigator.clipboard.writeText(completeSentence)
    .then(() => {
      showToast("📋 의사전달용 메모가 클립보드에 복사되었습니다!");
    })
    .catch((err) => {
      console.error("클립보드 복사 실패: ", err);
      // Fallback
      alert(`복사 실패. 아래 텍스트를 수동 복사하세요:\n\n${completeSentence}`);
    });
};

// 토스트 안내창 띄우기 함수
function showToast(message) {
  const toast = document.getElementById("toastMsg");
  toast.querySelector(".toast-text").textContent = message;
  toast.classList.add("show");
  
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// ==========================================
// [10] 복약 안심 타이머 로직 (Dose Timer)
// ==========================================
let timerInterval = null;

function initDoseTimer() {
  updateDoseTimerUI();
  // 1초 단위로 타이머 카운트다운 새로고침
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateDoseTimerUI, 1000);
}

function recordDoseTaken() {
  const now = new Date().getTime();
  localStorage.setItem("lastDoseTime", now);
  showToast("💊 복약 정보가 저장되었습니다! 6시간 안심 타이머가 시작됩니다.");
  initDoseTimer();
}

function updateDoseTimerUI() {
  const timerCountdown = document.getElementById("timerCountdown");
  const lastDoseTime = localStorage.getItem("lastDoseTime");

  if (!lastDoseTime) {
    timerCountdown.textContent = "--시간 --분 --초";
    return;
  }

  const now = new Date().getTime();
  const diffMs = now - Number(lastDoseTime);
  const sixHoursMs = 6 * 60 * 60 * 1000; // 6시간

  if (diffMs < sixHoursMs) {
    // 다음 복약 대기 시간 계산
    const remainMs = sixHoursMs - diffMs;
    const remainHours = Math.floor(remainMs / (1000 * 60 * 60));
    const remainMins = Math.floor((remainMs % (1000 * 60 * 60)) / (1000 * 60));
    const remainSecs = Math.floor((remainMs % (1000 * 60)) / 1000);

    const pad = (num) => String(num).padStart(2, '0');
    timerCountdown.innerHTML = `<span style="color:var(--accent-color)">${pad(remainHours)}:${pad(remainMins)}:${pad(remainSecs)}</span> 남음`;
  } else {
    // 6시간 경과 시 복약 가능 알림
    timerCountdown.innerHTML = `<span style="color:var(--primary-color)">추가 복용 가능 💊</span>`;
  }
}
