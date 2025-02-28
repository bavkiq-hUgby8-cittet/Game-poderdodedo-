/********** CONFIG DO FIREBASE **********/
const firebaseConfig = {
  apiKey: "AIzaSyBQ5czr0wUqNxyqU9X_WHO3DrHOYEAPf7M",
  authDomain: "opoderdodedo.firebaseapp.com",
  databaseURL: "https://opoderdodedo-default-rtdb.firebaseio.com",
  projectId: "opoderdodedo",
  storageBucket: "opoderdodedo.firebasestorage.app",
  messagingSenderId: "931089125837",
  appId: "1:931089125837:web:fa22ae36bd206f28cf7484",
  measurementId: "G-6YE1KQ0VQC"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const storage = firebase.storage();

/********** PEGA ELEMENTOS DO DOM (Host e Player) **********/
const modeSelect = document.getElementById('modeSelect');
const btnHost = document.getElementById('btnHost');
const btnPlayer = document.getElementById('btnPlayer');
const hostCard = document.getElementById('hostCard');
const playerCard = document.getElementById('playerCard');

// Host
const hostArea = document.getElementById('hostArea');
const hostStep1 = document.getElementById('hostStep1');
const btnCreateGame = document.getElementById('btnCreateGame');
const inputGameCodeHost = document.getElementById('inputGameCodeHost');
const btnJoinGameHost = document.getElementById('btnJoinGameHost');

const hostLobby = document.getElementById('hostLobby');
const hostGame = document.getElementById('hostGame');
const hostGameCode = document.getElementById('hostGameCode');
const qrCodeLobby = document.getElementById('qrCodeLobby');
const qrCodeGame = document.getElementById('qrCodeGame');
const hostLinkInfo = document.getElementById('hostLinkInfo');
const hostPlayersList = document.getElementById('hostPlayersList');
const btnStartGame = document.getElementById('btnStartGame');
const hostStatusPanel = document.getElementById('hostStatusPanel');
const btnDrawCard = document.getElementById('btnDrawCard');
const deckCount = document.getElementById('deckCount');
const deckView = document.getElementById('deckView');
const currentCardHost = document.getElementById('currentCardHost');
const hostRules = document.getElementById('hostRules');
const hostPlayersStatus = document.getElementById('hostPlayersStatus');
const hostPainel = document.getElementById('hostPainel');
const hostChat = document.getElementById('hostChat');
const hostChatInput = document.getElementById('hostChatInput');
const btnHostSendChat = document.getElementById('btnHostSendChat');
const btnEndGame = document.getElementById('btnEndGame');

// Player
const playerArea = document.getElementById('playerArea');
const playerStep1 = document.getElementById('playerStep1');
const inputGameCodePlayer = document.getElementById('inputGameCodePlayer');
const btnEnterCodePlayer = document.getElementById('btnEnterCodePlayer');

const playerRegister = document.getElementById('playerRegister');
const inputPlayerName = document.getElementById('inputPlayerName');
const btnJoinPlayerGame = document.getElementById('btnJoinPlayerGame');

const playerLobby = document.getElementById('playerLobby');
const playerLobbyList = document.getElementById('playerLobbyList');
const playerGame = document.getElementById('playerGame');
const playerStatusPanel = document.getElementById('playerStatusPanel');
const currentCardPlayer = document.getElementById('currentCardPlayer');
const btnDrawCardPlayer = document.getElementById('btnDrawCardPlayer');
const deckCountPlayer = document.getElementById('deckCountPlayer');
const deckViewPlayer = document.getElementById('deckViewPlayer');
const playerRules = document.getElementById('playerRules');
const playerListStatus = document.getElementById('playerListStatus');
const fingerBox = document.getElementById('fingerBox');
const btnFingerClick = document.getElementById('btnFingerClick');
const btnUseJoker = document.getElementById('btnUseJoker');
const btnActivateFinger = document.getElementById('btnActivateFinger');
const btnRecordVideo = document.getElementById('btnRecordVideo');
const playerPainel = document.getElementById('playerPainel');
const playerChat = document.getElementById('playerChat');
const playerChatInput = document.getElementById('playerChatInput');
const btnPlayerSendChat = document.getElementById('btnPlayerSendChat');

const videoOverlay = document.getElementById('videoOverlay');
const videoPreview = document.getElementById('videoPreview');
const btnStartRecording = document.getElementById('btnStartRecording');
const btnStopRecording = document.getElementById('btnStopRecording');
const btnCloseVideoOverlay = document.getElementById('btnCloseVideoOverlay');

/********** VARIÁVEIS GLOBAIS **********/
let gameCode = null;
let myPlayerKey = null;
let localCameraStream = null;
let mediaRecorder = null;
let recordedChunks = [];

/********** EVENTOS BÁSICOS **********/
// Modo de seleção com cliques nos cards também
hostCard.onclick = () => {
  modeSelect.classList.add('hidden');
  hostArea.classList.remove('hidden');
};

playerCard.onclick = () => {
  modeSelect.classList.add('hidden');
  playerArea.classList.remove('hidden');
};

// Botões originais também funcionam
btnHost.onclick = () => {
  modeSelect.classList.add('hidden');
  hostArea.classList.remove('hidden');
};

btnPlayer.onclick = () => {
  modeSelect.classList.add('hidden');
  playerArea.classList.remove('hidden');
};

// Host
btnCreateGame.onclick = createGameAsHost;
btnJoinGameHost.onclick = joinGameAsHost;
btnStartGame.onclick = startGameHost;
btnDrawCard.onclick = drawCardHost;
btnEndGame.onclick = endGameHost;
btnHostSendChat.onclick = sendChatAsHost;

// Enter para enviar mensagens
hostChatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendChatAsHost();
  }
});

// Player
btnEnterCodePlayer.onclick = enterCodePlayer;
btnJoinPlayerGame.onclick = registerPlayerInGame;
btnDrawCardPlayer.onclick = drawCardPlayer;
btnUseJoker.onclick = useJokerPlayer;
btnActivateFinger.onclick = activateFingerPower;
btnFingerClick.onclick = fingerClick;
btnRecordVideo.onclick = () => videoOverlay.style.display = 'flex';
btnCloseVideoOverlay.onclick = closeVideoOverlay;
btnStartRecording.onclick = startVideoRecording;
btnStopRecording.onclick = stopVideoRecording;
btnPlayerSendChat.onclick = sendChatAsPlayer;

// Enter para enviar mensagens
playerChatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendChatAsPlayer();
  }
});

// Enter para enviar código
inputGameCodePlayer.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    enterCodePlayer();
  }
});

inputGameCodeHost.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    joinGameAsHost();
  }
});

inputPlayerName.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    registerPlayerInGame();
  }
});

/********** CHECK LOCALSTORAGE DO PLAYER **********/
(async function checkLocalStoragePlayer(){
  const savedId = localStorage.getItem("opoderdedo_gameId");
  const savedKey= localStorage.getItem("opoderdedo_playerKey");
  if(savedId && savedKey){
    // Verifica no DB
    const snap = await db.ref(`games/${savedId}/players/${savedKey}`).once('value');
    if(snap.exists()){
      // Reconectar
      gameCode = savedId;
      myPlayerKey = savedKey;
      db.ref(`games/${gameCode}`).on('value', s=>{
        if(!s.exists())return;
        updatePlayerView(s.val());
      });
      // Ajusta telas
      modeSelect.classList.add('hidden');
      playerArea.classList.remove('hidden');
      playerStep1.classList.add('hidden');
      playerRegister.classList.add('hidden');
    } else {
      localStorage.removeItem("opoderdedo_gameId");
      localStorage.removeItem("opoderdedo_playerKey");
    }
  }
})();

/********** FUNÇÕES DE HOST **********/
async function createGameAsHost(){
  // Feedback visual
  btnCreateGame.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando...';
  btnCreateGame.disabled = true;
  
  gameCode = generateGameCode();
  const deck = generateDeck();
  const initialData = {
    status:'lobby',
    players:{},
    deck,
    currentCard:null,
    currentPlayerIndex:0,
    direction:1,
    rules:[],
    logs:[],
    fingerPower:{ active:false, owner:null, queue:[]},
    chat:[]
  };
  
  try {
    await db.ref(`games/${gameCode}`).set(initialData);
    showHostLobby(gameCode);
    subscribeHost(gameCode);
  } catch (error) {
    alert("Erro ao criar partida: " + error.message);
  } finally {
    btnCreateGame.innerHTML = '<i class="fas fa-plus-circle"></i> Criar Nova Partida';
    btnCreateGame.disabled = false;
  }
}

async function joinGameAsHost(){
  // Feedback visual
  btnJoinGameHost.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
  btnJoinGameHost.disabled = true;
  
  const code = inputGameCodeHost.value.trim();
  if(!code) {
    alert("Digite um código!");
    btnJoinGameHost.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar na Partida';
    btnJoinGameHost.disabled = false;
    return;
  }
  
  try {
    const snap = await db.ref(`games/${code}`).once('value');
    if(!snap.exists()){
      alert("Partida não encontrada!");
      btnJoinGameHost.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar na Partida';
      btnJoinGameHost.disabled = false;
      return;
    }
    gameCode=code;
    showHostLobby(code);
    subscribeHost(code);
  } catch (error) {
    alert("Erro ao entrar na partida: " + error.message);
    btnJoinGameHost.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar na Partida';
    btnJoinGameHost.disabled = false;
  }
}

function showHostLobby(code){
  hostStep1.classList.add('hidden');
  hostLobby.classList.remove('hidden');
  hostGameCode.textContent=code;
  qrCodeLobby.innerHTML='';
  new QRCode(qrCodeLobby,{text: location.origin+location.pathname+`?gameId=${code}`, width:160, height:160});
  hostLinkInfo.textContent=`Link: ${location.origin+location.pathname}?gameId=${code}`;
}

function subscribeHost(code){
  db.ref(`games/${code}`).on('value', snap=>{
    if(!snap.exists())return;
    const data = snap.val();
    if(data.status==='lobby'){
      renderHostLobby(data);
    } else if(data.status==='ongoing'){
      hostLobby.classList.add('hidden');
      hostGame.classList.remove('hidden');
      renderHostGame(data);
    } else if(data.status==='finished'){
      alert("Partida Encerrada!");
      location.reload(); // Recarrega para voltar à tela inicial
    }
  });
}

function renderHostLobby(data){
  const players = Object.values(data.players||{});
  
  if (players.length === 0) {
    hostPlayersList.innerHTML = '<div style="text-align: center; color: #888;"><i class="fas fa-info-circle"></i> Nenhum jogador conectado ainda</div>';
  } else {
    hostPlayersList.innerHTML = players.map((p, index) => `
      <div class="player-item">
        <div class="player-avatar">${p.name.charAt(0).toUpperCase()}</div>
        <div class="player-name">${p.name}</div>
      </div>
    `).join('');
  }
  
  // Ativar botão quando tiver jogadores
  btnStartGame.disabled = players.length === 0;
  if (players.length === 0) {
    btnStartGame.innerHTML = '<i class="fas fa-users-slash"></i> Aguardando Jogadores';
    btnStartGame.classList.add('btn-dark');
    btnStartGame.classList.remove('btn-primary');
  } else {
    btnStartGame.innerHTML = '<i class="fas fa-play-circle"></i> Iniciar Partida';
    btnStartGame.classList.add('btn-primary');
    btnStartGame.classList.remove('btn-dark');
  }
}

function startGameHost(){
  if (btnStartGame.disabled) return;
  
  btnStartGame.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando...';
  btnStartGame.disabled = true;
  
  db.ref(`games/${gameCode}`).update({status:'ongoing'})
    .catch(error => {
      alert("Erro ao iniciar partida: " + error.message);
      btnStartGame.innerHTML = '<i class="fas fa-play-circle"></i> Iniciar Partida';
      btnStartGame.disabled = false;
    });
}

function renderHostGame(data){
  const players = Object.values(data.players||{});
  const currPlayer = players[data.currentPlayerIndex];
  const currName = currPlayer?.name || '???';
  
  hostStatusPanel.innerHTML = `<i class="fas fa-user-clock"></i> É a vez de: <strong>${currName}</strong>`;

  qrCodeGame.innerHTML='';
  new QRCode(qrCodeGame, {
    text: location.origin+location.pathname+`?gameId=${gameCode}`,
    width: 100, 
    height: 100
  });

  const remainingCards = data.deck ? data.deck.length : 0;
  deckCount.innerHTML = `<i class="fas fa-layer-group"></i> Cartas restantes: <strong>${remainingCards}</strong>`;
  
  deckView.innerHTML = (data.deck||[]).map(() => `<div class="card-back"></div>`).join('');

  if(data.currentCard){
    currentCardHost.innerHTML = renderCard(data.currentCard.rank, data.currentCard.suit);
  } else {
    currentCardHost.innerHTML = `<div style="text-align: center; color: #888; margin: 20px 0;"><i class="fas fa-info-circle"></i> Nenhuma carta jogada ainda</div>`;
  }

  if(data.rules && data.rules.length > 0){
    hostRules.innerHTML = data.rules.map(r => `<div class="rule-item">${r}</div>`).join('');
  } else {
    hostRules.innerHTML = `<div style="text-align: center; color: #888; padding: 10px;"><i class="fas fa-info-circle"></i> Nenhuma regra definida</div>`;
  }

  // Lista de jogadores - destaque para quem tem poder do dedo
  hostPlayersStatus.innerHTML = players.map((p, i) => {
    const isCurrent = (i === data.currentPlayerIndex);
    const avatarLetter = p.name.charAt(0).toUpperCase();
    let html = `<div class="player-item ${isCurrent ? 'current' : ''} ${p.hasFingerPower ? 'finger-power' : ''}">
      <div class="player-avatar" ${p.hasFingerPower ? 'style="background: var(--warning); color: var(--dark);"' : ''}>${avatarLetter}</div>
      <div class="player-name">${p.name}</div>
      <div class="player-badges">`;
    
    if (isCurrent) {
      html += `<span class="badge badge-turn"><i class="fas fa-play"></i> Vez</span>`;
    }
    
    if (p.jokers && p.jokers > 0) {
      html += `<span class="badge badge-joker"><i class="fas fa-magic"></i> ${p.jokers}</span>`;
    }
    
    if (p.hasFingerPower) {
      html += `<span class="badge" style="background-color: var(--warning); color: var(--dark);"><i class="fas fa-hand-point-up"></i> Poder do Dedo</span>`;
    }
    
    html += `</div></div>`;
    return html;
  }).join('');

  // Painel de eventos - centralizado e destacado
  if(data.logs && data.logs.length > 0){
    hostPainel.innerHTML = data.logs.map(l => `<div>${l}</div>`).join('');
    hostPainel.scrollTop = hostPainel.scrollHeight;
  } else {
    hostPainel.innerHTML = `<div style="text-align: center; color: #888;"><i class="fas fa-info-circle"></i> Nenhum evento registrado</div>`;
  }
  
  // Chat
  if(data.chat && data.chat.length > 0){
    hostChat.innerHTML = data.chat.map(c => {
      const isHost = c.from === 'HOST';
      return `<div class="chat-message ${isHost ? 'host-message' : ''}">
        <strong>${c.from}:</strong> ${c.text}
      </div>`;
    }).join('');
    hostChat.scrollTop = hostChat.scrollHeight;
  } else {
    hostChat.innerHTML = `<div style="text-align: center; color: #888; padding: 20px;"><i class="fas fa-comments"></i> Nenhuma mensagem ainda</div>`;
  }
  
  // Ajustar botão de puxar carta conforme estado do baralho
  if (!data.deck || data.deck.length === 0) {
    btnDrawCard.disabled = true;
    btnDrawCard.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Baralho vazio';
  } else {
    btnDrawCard.disabled = false;
    btnDrawCard.innerHTML = '<i class="fas fa-hand-paper"></i> Puxar Carta';
  }
  
  // Adicionar botão para finalizar Poder do Dedo se estiver ativo
  const fp = data.fingerPower || {};
  if(fp.active) {
    // Pode adicionar um botão específico no painel do host para finalizar o poder do dedo
    if (!document.getElementById('btnFinalizeFinger')) {
      const btnFinalizeFinger = document.createElement('button');
      btnFinalizeFinger.id = 'btnFinalizeFinger';
      btnFinalizeFinger.className = 'btn-danger';
      btnFinalizeFinger.innerHTML = '<i class="fas fa-stop-circle"></i> Finalizar Poder do Dedo';
      btnFinalizeFinger.onclick = finalizeFingerPower;
      
      // Adicionar antes do botão de encerrar partida
      btnEndGame.parentNode.insertBefore(btnFinalizeFinger, btnEndGame);
    }
  } else {
    // Remover o botão se não estiver ativo
    const btnFinalizeFinger = document.getElementById('btnFinalizeFinger');
    if (btnFinalizeFinger) {
      btnFinalizeFinger.remove();
    }
  }
}

async function drawCardHost(){
  // Feedback visual
  btnDrawCard.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Puxando...';
  btnDrawCard.disabled = true;
  
  try {
    const snap = await db.ref(`games/${gameCode}`).once('value');
    const gameData = snap.val();
    
    if(!gameData.deck || gameData.deck.length === 0){
      addLog("Baralho acabou!");
      btnDrawCard.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Baralho vazio';
      return;
    }
    
    const card = gameData.deck[0];
    const newDeck = gameData.deck.slice(1);
    handleCardEffect(card, gameData);
    
    await db.ref(`games/${gameCode}`).update({
      deck: newDeck,
      currentCard: card
    });
  } catch (error) {
    alert("Erro ao puxar carta: " + error.message);
  } finally {
    btnDrawCard.innerHTML = '<i class="fas fa-hand-paper"></i> Puxar Carta';
    btnDrawCard.disabled = false;
  }
}

function endGameHost(){
  if (confirm("Tem certeza que deseja encerrar a partida?")) {
    db.ref(`games/${gameCode}`).update({status: 'finished'})
      .catch(error => alert("Erro ao encerrar partida: " + error.message));
  }
}

function sendChatAsHost(){
  const txt = hostChatInput.value.trim();
  if(!txt) return;
  
  hostChatInput.value = '';
  db.ref(`games/${gameCode}/chat`).once('value', snap => {
    let arr = snap.val() || [];
    arr.push({from: 'HOST', text: txt, ts: Date.now()});
    db.ref(`games/${gameCode}/chat`).set(arr)
      .catch(error => alert("Erro ao enviar mensagem: " + error.message));
  });
}

/********** EFEITOS DE CARTA **********/
function handleCardEffect(card, gameData){
  let logs = gameData.logs || [];
  const players = Object.values(gameData.players || {});
  let idx = gameData.currentPlayerIndex;
  let direction = gameData.direction;
  let rules = gameData.rules || [];
  const currName = players[idx]?.name || '???';
  
  const suitSymbol = card.suit === '♥' ? '♥️' : 
                     card.suit === '♦' ? '♦️' : 
                     card.suit === '♣' ? '♣️' : 
                     card.suit === '♠' ? '♠️' : '';
                     
  logs.push(`${currName} puxou [${card.rank}${card.suit !== 'Coringa' ? suitSymbol : ''}]`);

  let passTurn = true;
  switch(card.rank){
    case '4':
      const newRule = prompt("Defina uma nova regra:");
      if(newRule){
        rules.push(newRule);
        logs.push(`🎮 Regra adicionada: "${newRule}"`);
      }
      break;
    case '6':
      rules = [];
      logs.push("💥 Todas as regras foram quebradas!");
      break;
    case '8':
      const pKey = Object.keys(gameData.players || {})[idx];
      if(pKey){
        db.ref(`games/${gameCode}/players/${pKey}/hasFingerPower`).set(true);
        logs.push(`👆 ${currName} obteve o Poder do Dedo!`);
      }
      break;
    case '9':
      direction *= -1;
      logs.push("🔄 O sentido foi invertido!");
      break;
    case '10':
      passTurn = false;
      setTimeout(() => {
        let ni = idx + direction;
        if(ni < 0) ni = players.length - 1;
        if(ni >= players.length) ni = 0;
        ni += direction;
        if(ni < 0) ni = players.length - 1;
        if(ni >= players.length) ni = 0;
        db.ref(`games/${gameCode}`).update({
          currentPlayerIndex: ni, direction, rules, logs
        });
      }, 500);
      break;
    case 'J':
      logs.push(`🍺 ${currName} bebe 1 dose!`);
      sendDrinkAlert(idx, gameData);
      break;
    case 'Q':
      logs.push("👸 Todas as mulheres bebem 1 dose!");
      break;
    case 'K':
      logs.push("👑 Todos os homens bebem 1 dose!");
      break;
    case 'Joker':
      // coringa
      const jkKey = Object.keys(gameData.players || {})[idx];
      if(jkKey){
        const oldVal = players[idx].jokers || 0;
        db.ref(`games/${gameCode}/players/${jkKey}/jokers`).set(oldVal + 1);
        logs.push(`🃏 ${currName} ganhou 1 Coringa!`);
      }
      break;
    default:
      // A,2,3,5,7 etc
  }

  if(passTurn && card.rank !== '10'){
    let ni = idx + direction;
    if(ni < 0) ni = players.length - 1;
    if(ni >= players.length) ni = 0;
    db.ref(`games/${gameCode}`).update({
      currentPlayerIndex: ni, direction, rules, logs
    });
  } else {
    db.ref(`games/${gameCode}`).update({ direction, rules, logs });
  }
}

function sendDrinkAlert(playerIndex, gameData){
  const pKey = Object.keys(gameData.players || {})[playerIndex];
  if(!pKey) return;
  db.ref(`games/${gameCode}/players/${pKey}/needsToDrink`).set(Date.now());
}

/********** MODO JOGADOR **********/
(function checkUrlForGameId(){
  const params = new URLSearchParams(location.search);
  if(params.has('gameId')){
    const code = params.get('gameId');
    if(code){
      modeSelect.classList.add('hidden');
      playerArea.classList.remove('hidden');
      inputGameCodePlayer.value = code;
      enterCodePlayer();
    }
  }
})();

function enterCodePlayer(){
  const code = inputGameCodePlayer.value.trim();
  if(!code) {
    alert("Digite um código!");
    return;
  }
  
  btnEnterCodePlayer.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
  btnEnterCodePlayer.disabled = true;
  
  db.ref(`games/${code}`).once('value', snap => {
    btnEnterCodePlayer.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar na Partida';
    btnEnterCodePlayer.disabled = false;
    
    if(!snap.exists()){
      alert("Partida não encontrada!");
      return;
    }
    
    const gameData = snap.val();
    if (gameData.status === 'finished') {
      alert("Esta partida já foi encerrada!");
      return;
    }
    
    gameCode = code;
    playerStep1.classList.add('hidden');
    playerRegister.classList.remove('hidden');
  }).catch(error => {
    alert("Erro ao verificar código: " + error.message);
    btnEnterCodePlayer.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar na Partida';
    btnEnterCodePlayer.disabled = false;
  });
}

async function registerPlayerInGame(){
  const name = inputPlayerName.value.trim();
  if(!name) {
    alert("Digite seu nome!");
    return;
  }
  
  btnJoinPlayerGame.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
  btnJoinPlayerGame.disabled = true;
  
  try {
    // Cria player
    const ref = db.ref(`games/${gameCode}/players`).push();
    myPlayerKey = ref.key;
    await ref.set({
      name, 
      jokers: 0,
      hasFingerPower: false
    });

    localStorage.setItem("opoderdedo_gameId", gameCode);
    localStorage.setItem("opoderdedo_playerKey", myPlayerKey);
    localStorage.setItem("opoderdedo_playerName", name);

    db.ref(`games/${gameCode}`).on('value', s => {
      if(!s.exists()) return;
      updatePlayerView(s.val());
    });

    playerRegister.classList.add('hidden');
    
  } catch (error) {
    alert("Erro ao entrar na partida: " + error.message);
    btnJoinPlayerGame.innerHTML = '<i class="fas fa-check-circle"></i> Confirmar e Entrar';
    btnJoinPlayerGame.disabled = false;
  }
}

function updatePlayerView(gameData){
  if(gameData.status === 'lobby'){
    playerLobby.classList.remove('hidden');
    playerGame.classList.add('hidden');
    
    const players = Object.values(gameData.players || {});
    
    if (players.length === 0) {
      playerLobbyList.innerHTML = '<div style="text-align: center; color: #888;"><i class="fas fa-info-circle"></i> Nenhum outro jogador conectado</div>';
    } else {
      playerLobbyList.innerHTML = players.map(p => `
        <div class="player-item">
          <div class="player-avatar">${p.name.charAt(0).toUpperCase()}</div>
          <div class="player-name">${p.name}</div>
        </div>
      `).join('');
    }
  }
  else if(gameData.status === 'ongoing'){
    playerLobby.classList.add('hidden');
    playerGame.classList.remove('hidden');

    const pObj = gameData.players?.[myPlayerKey];
    if(!pObj){
      playerStatusPanel.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Você não está no jogo!';
      playerStatusPanel.classList.remove('hidden');
      return;
    }
    
    // Info do player
    playerStatusPanel.classList.remove('hidden');
    playerStatusPanel.style.color = 'var(--primary-dark)';
    playerStatusPanel.innerHTML = '';

    // Jogadores - destaque para quem tem poder do dedo
    const players = Object.values(gameData.players || {});
    
    playerListStatus.innerHTML = players.map((pp, i) => {
      const isCurrent = (i === gameData.currentPlayerIndex);
      const avatarLetter = pp.name.charAt(0).toUpperCase();
      
      let html = `<div class="player-item ${isCurrent ? 'current' : ''} ${pp.hasFingerPower ? 'finger-power' : ''}">
        <div class="player-avatar" ${pp.hasFingerPower ? 'style="background: var(--warning); color: var(--dark);"' : ''}>${avatarLetter}</div>
        <div class="player-name">${pp.name}</div>
        <div class="player-badges">`;
      
      if (isCurrent) {
        html += `<span class="badge badge-turn"><i class="fas fa-play"></i> Vez</span>`;
      }
      
      if (pp.jokers && pp.jokers > 0) {
        html += `<span class="badge badge-joker"><i class="fas fa-magic"></i> ${pp.jokers}</span>`;
      }
      
      if (pp.hasFingerPower) {
        html += `<span class="badge" style="background-color: var(--warning); color: var(--dark);"><i class="fas fa-hand-point-up"></i> Poder do Dedo</span>`;
      }
      
      html += `</div></div>`;
      return html;
    }).join('');

    // Deck
    const remainingCards = gameData.deck ? gameData.deck.length : 0;
    deckCountPlayer.innerHTML = `<i class="fas fa-layer-group"></i> Cartas restantes: <strong>${remainingCards}</strong>`;
    deckViewPlayer.innerHTML = (gameData.deck || []).map(() => `<div class="card-back"></div>`).join('');

    // Quem é o atual
    const allKeys = Object.keys(gameData.players || {});
    const curIdx = gameData.currentPlayerIndex;
    const curKey = allKeys[curIdx];
    
    if(curKey === myPlayerKey){
      // é minha vez
      playerStatusPanel.innerHTML = '<i class="fas fa-user-clock"></i> É A SUA VEZ!';
      playerStatusPanel.style.color = 'var(--success)';
      btnDrawCardPlayer.style.display = 'inline-block';
      
      if (!gameData.deck || gameData.deck.length === 0) {
        btnDrawCardPlayer.disabled = true;
        btnDrawCardPlayer.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Baralho vazio';
      } else {
        btnDrawCardPlayer.disabled = false;
        btnDrawCardPlayer.innerHTML = '<i class="fas fa-hand-paper"></i> Puxar Carta';
      }
    } else {
      const currentPlayer = players[curIdx]?.name || '???';
      playerStatusPanel.innerHTML = `<i class="fas fa-user-clock"></i> É a vez de: <strong>${currentPlayer}</strong>`;
      btnDrawCardPlayer.style.display = 'none';
    }

    // Carta Atual
    if(gameData.currentCard){
      currentCardPlayer.innerHTML = renderCard(gameData.currentCard.rank, gameData.currentCard.suit);
    } else {
      currentCardPlayer.innerHTML = `<div style="text-align: center; color: #888; margin: 20px 0;"><i class="fas fa-info-circle"></i> Nenhuma carta jogada ainda</div>`;
    }

    // Regras
    if(gameData.rules && gameData.rules.length > 0){
      playerRules.innerHTML = gameData.rules.map(r => `<div class="rule-item">${r}</div>`).join('');
    } else {
      playerRules.innerHTML = `<div style="text-align: center; color: #888; padding: 10px;"><i class="fas fa-info-circle"></i> Nenhuma regra definida</div>`;
    }

    // Jogador tem finger? - mostrar de forma mais proeminente
    if (pObj.hasFingerPower) {
      btnActivateFinger.style.display = 'inline-block';
      btnActivateFinger.innerHTML = '<i class="fas fa-hand-point-up"></i> Ativar Poder do Dedo';
      btnActivateFinger.className = 'btn-warning';
      // Adicionar animação para chamar atenção
      btnActivateFinger.classList.add('animate-pulse');
      
      // Indica no status panel também
      if (playerStatusPanel.innerHTML.indexOf('Poder do Dedo') === -1) {
        playerStatusPanel.innerHTML += `<div style="margin-top: 5px;"><i class="fas fa-hand-point-up"></i> Você tem o <strong>Poder do Dedo</strong> - Use quando quiser!</div>`;
      }
    } else {
      btnActivateFinger.style.display = 'none';
      btnActivateFinger.classList.remove('animate-pulse');
    }
    
    // Jogador tem coringa?
    btnUseJoker.style.display = (pObj.jokers > 0) ? 'inline-block' : 'none';
    if (pObj.jokers > 0) {
      btnUseJoker.innerHTML = `<i class="fas fa-magic"></i> Usar Coringa (${pObj.jokers})`;
    }

    // Finger Power Global
    const fp = gameData.fingerPower || {};
    if(fp.active){
      fingerBox.classList.remove('hidden');
      const found = (fp.queue || []).find(x => x.playerKey === myPlayerKey);
      
      if(found){
        btnFingerClick.disabled = true;
        btnFingerClick.innerHTML = '<i class="fas fa-check-circle"></i> Você já clicou!';
      } else {
        btnFingerClick.disabled = false;
        btnFingerClick.innerHTML = '<i class="fas fa-bolt"></i> CLIQUE AGORA!';
      }
      
      fingerQueue.innerHTML = (fp.queue || []).map((x, i) => `${i+1}º: <strong>${x.name}</strong>`).join('<br>');
    } else {
      fingerBox.classList.add('hidden');
    }

    // Painel de eventos - centralizado e destacado
    if(gameData.logs && gameData.logs.length > 0){
      playerPainel.innerHTML = gameData.logs.map(l => `<div>${l}</div>`).join('');
      playerPainel.scrollTop = playerPainel.scrollHeight;
    } else {
      playerPainel.innerHTML = `<div style="text-align: center; color: #888;"><i class="fas fa-info-circle"></i> Nenhum evento registrado</div>`;
    }
    
    // Chat
    if(gameData.chat && gameData.chat.length > 0){
      playerChat.innerHTML = gameData.chat.map(c => {
        const isHost = c.from === 'HOST';
        return `<div class="chat-message ${isHost ? 'host-message' : ''}">
          <strong>${c.from}:</strong> ${c.text}
        </div>`;
      }).join('');
      playerChat.scrollTop = playerChat.scrollHeight;
    } else {
      playerChat.innerHTML = `<div style="text-align: center; color: #888; padding: 20px;"><i class="fas fa-comments"></i> Nenhuma mensagem ainda</div>`;
    }

    // Needs to Drink?
    if(pObj.needsToDrink){
      alert("🍺 Você precisa beber!");
      db.ref(`games/${gameCode}/players/${myPlayerKey}/needsToDrink`).remove();
    }
  }
  else if(gameData.status === 'finished'){
    alert("Esta partida foi encerrada!");
    setTimeout(() => location.reload(), 1000); // Recarrega após o alerta
  }
}

async function drawCardPlayer(){
  btnDrawCardPlayer.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Puxando...';
  btnDrawCardPlayer.disabled = true;
  
  try {
    const snap = await db.ref(`games/${gameCode}`).once('value');
    const data = snap.val();
    if(!data) return;
    
    const allKeys = Object.keys(data.players || {});
    if(allKeys[data.currentPlayerIndex] !== myPlayerKey){
      alert("Não é sua vez de puxar carta!");
      btnDrawCardPlayer.innerHTML = '<i class="fas fa-hand-paper"></i> Puxar Carta';
      btnDrawCardPlayer.disabled = false;
      return;
    }
    
    if(!data.deck || data.deck.length === 0){
      addLog("Baralho acabou!");
      btnDrawCardPlayer.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Baralho vazio';
      btnDrawCardPlayer.disabled = true;
      return;
    }
    
    const card = data.deck[0];
    const newDeck = data.deck.slice(1);
    handleCardEffect(card, data);
    
    await db.ref(`games/${gameCode}`).update({
      deck: newDeck, 
      currentCard: card
    });
  } catch (error) {
    alert("Erro ao puxar carta: " + error.message);
  } finally {
    btnDrawCardPlayer.innerHTML = '<i class="fas fa-hand-paper"></i> Puxar Carta';
    btnDrawCardPlayer.disabled = false;
  }
}

/********** CORINGA, PODER DEDO **********/
function useJokerPlayer(){
  btnUseJoker.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  btnUseJoker.disabled = true;
  
  db.ref(`games/${gameCode}/players/${myPlayerKey}`).once('value', snap => {
    const p = snap.val();
    if(!p) return;
    
    if(p.jokers > 0){
      db.ref(`games/${gameCode}/players/${myPlayerKey}/jokers`).set(p.jokers - 1);
      addLog(`🃏 ${p.name} usou 1 Coringa para não beber!`);
      setTimeout(() => {
        btnUseJoker.innerHTML = '<i class="fas fa-magic"></i> Usar Coringa';
        btnUseJoker.disabled = false;
      }, 500);
    } else {
      btnUseJoker.style.display = 'none';
    }
  });
}

function activateFingerPower(){
  btnActivateFinger.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  btnActivateFinger.disabled = true;
  
  const name = localStorage.getItem("opoderdedo_playerName") || 'Jogador';
  db.ref(`games/${gameCode}/fingerPower`).set({
    active: true, 
    owner: myPlayerKey,
    queue: [{playerKey: myPlayerKey, name}]
  });
  
  db.ref(`games/${gameCode}/players/${myPlayerKey}/hasFingerPower`).set(false);
  addLog(`👆 ${name} ativou o Poder do Dedo!`);
  
  // Desativa o botão e depois esconde após animação
  setTimeout(() => {
    btnActivateFinger.style.display = 'none';
    btnActivateFinger.disabled = false;
    btnActivateFinger.innerHTML = '<i class="fas fa-hand-point-up"></i> Poder do Dedo (8)';
  }, 500);
  
  // Não finaliza automaticamente - o organizador pode finalizar manualmente
}

function fingerClick(){
  btnFingerClick.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  btnFingerClick.disabled = true;
  
  db.ref(`games/${gameCode}/fingerPower/queue`).once('value', snap => {
    let arr = snap.val() || [];
    if(arr.find(x => x.playerKey === myPlayerKey)) return;
    
    const name = localStorage.getItem("opoderdedo_playerName") || 'Jogador';
    arr.push({playerKey: myPlayerKey, name});
    db.ref(`games/${gameCode}/fingerPower/queue`).set(arr)
      .then(() => {
        btnFingerClick.innerHTML = '<i class="fas fa-check-circle"></i> Você já clicou!';
      })
      .catch(error => {
        alert("Erro ao registrar clique: " + error.message);
        btnFingerClick.innerHTML = '<i class="fas fa-bolt"></i> CLIQUE AGORA!';
        btnFingerClick.disabled = false;
      });
  });
}

function finalizeFingerPower(){
  db.ref(`games/${gameCode}/fingerPower`).once('value', snap => {
    const fp = snap.val();
    if(!fp || !fp.queue || fp.queue.length === 0) return;
    
    const last = fp.queue[fp.queue.length - 1];
    addLog(`⏱️ O último a clicar foi ${last.name}, beba!`);
    db.ref(`games/${gameCode}/players/${last.playerKey}/needsToDrink`).set(Date.now());
    db.ref(`games/${gameCode}/fingerPower`).update({active: false, queue: []});
  });
}

/********** GRAVAÇÃO VÍDEO **********/
async function startVideoRecording(){
  btnStartRecording.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inicializando...';
  btnStartRecording.disabled = true;
  
  try {
    if(!localCameraStream){
      localCameraStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
      videoPreview.srcObject = localCameraStream;
    }
    
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(localCameraStream);
    
    mediaRecorder.ondataavailable = e => {
      if(e.data.size > 0) recordedChunks.push(e.data);
    };
    
    mediaRecorder.onstop = async () => {
      btnStopRecording.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
      btnStopRecording.disabled = true;
      
      if(recordedChunks.length > 0){
        try {
          const blob = new Blob(recordedChunks, {type: 'video/mp4'});
          const ref = storage.ref(`games/${gameCode}/videos/${Date.now()}.mp4`);
          await ref.put(blob);
          const url = await ref.getDownloadURL();
          addLog(`📹 Vídeo gravado! URL: ${url}`);
          
          alert("Vídeo salvo com sucesso!");
        } catch (error) {
          alert("Erro ao salvar vídeo: " + error.message);
        } finally {
          btnStopRecording.innerHTML = '<i class="fas fa-stop"></i> Parar';
          btnStopRecording.disabled = false;
        }
      }
    };
    
    mediaRecorder.start();
    addLog("📹 Iniciou gravação de vídeo...");
    
    btnStartRecording.innerHTML = '<i class="fas fa-microphone"></i> Gravando...';
    btnStartRecording.disabled = true;
    btnStopRecording.disabled = false;
  } catch (err) {
    alert("Não foi possível acessar câmera: " + err);
    btnStartRecording.innerHTML = '<i class="fas fa-play"></i> Iniciar';
    btnStartRecording.disabled = false;
  }
}

function stopVideoRecording(){
  if(mediaRecorder && mediaRecorder.state === 'recording'){
    mediaRecorder.stop();
    addLog("📹 Parou gravação de vídeo.");
    btnStartRecording.innerHTML = '<i class="fas fa-play"></i> Iniciar';
    btnStartRecording.disabled = false;
  }
}

function closeVideoOverlay(){
  videoOverlay.style.display = 'none';
  if(localCameraStream){
    localCameraStream.getTracks().forEach(t => t.stop());
    localCameraStream = null;
  }
  videoPreview.srcObject = null;
  
  // Reset buttons
  btnStartRecording.innerHTML = '<i class="fas fa-play"></i> Iniciar';
  btnStartRecording.disabled = false;
  btnStopRecording.innerHTML = '<i class="fas fa-stop"></i> Parar';
  btnStopRecording.disabled = false;
}

/********** CHAT (PLAYER) **********/
function sendChatAsPlayer(){
  const txt = playerChatInput.value.trim();
  if(!txt) return;
  
  playerChatInput.value = '';
  db.ref(`games/${gameCode}/chat`).once('value', snap => {
    let arr = snap.val() || [];
    const name = localStorage.getItem("opoderdedo_playerName") || 'Jogador';
    arr.push({from: name, text: txt, ts: Date.now()});
    db.ref(`games/${gameCode}/chat`).set(arr)
      .catch(error => alert("Erro ao enviar mensagem: " + error.message));
  });
}

/********** LOG HELPER **********/
function addLog(msg){
  db.ref(`games/${gameCode}/logs`).once('value', snap => {
    let arr = snap.val() || [];
    arr.push(msg);
    db.ref(`games/${gameCode}/logs`).set(arr);
  });
}

/********** GERA CODE E BARALHO **********/
function generateGameCode(){
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateDeck(){
  const suits = ["♥","♦","♣","♠"];
  const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  let deck = [];
  
  for(let s of suits){
    for(let r of ranks){
      deck.push({rank: r, suit: s});
    }
  }
  
  for(let i = 0; i < 3; i++){
    deck.push({rank: 'Joker', suit: 'Coringa'});
  }
  
  // shuffle
  for(let i = deck.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  
  return deck;
}

function renderCard(rank, suit){
  if(rank === 'Joker'){
    return `
      <div class="card-front" style="background: linear-gradient(135deg, #ffd700 0%, #f9a825 100%);">
        <div class="card-center-symbol" style="font-size: 1.8rem; color: var(--dark);">
          <i class="fas fa-crown"></i><br>
          <span style="font-size: 1rem;">CORINGA</span>
        </div>
      </div>
    `;
  }
  
  const isRed = (suit === '♥' || suit === '♦');
  const suitSymbol = suit === '♥' ? '♥️' : 
                    suit === '♦' ? '♦️' : 
                    suit === '♣' ? '♣️' : 
                    suit === '♠' ? '♠️' : '';
                    
  return `
    <div class="card-front">
      <div class="card-rank-suit ${isRed ? 'red' : 'black'}">
        ${rank}${suitSymbol}
      </div>
      <div class="card-center-symbol ${isRed ? 'red' : 'black'}">
        ${rank}<br>${suitSymbol}
      </div>
    </div>
  `;
}
