//Função para criar um novo elemento.
function novoElemento(tagName, className){
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}
//Função construtora para criar as barreiras
function Barreira(reversa = false){
    this.elemento = novoElemento('div', 'barreira')

//Dependendo da posição ele pode criar primeiro o corpo e depois a borda ou o contrario.
    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa? corpo : borda)
    this.elemento.appendChild(reversa? borda : corpo)

    //Função para definir a altura da barreira;
    this.setAltura = altura => corpo.style.height = `${altura}px`
}

//Função contrutora para criar o par de barreiras.
function ParDeBarreiras(altura, abertura, x){
    this.elemento = novoElemento('div', 'par-de-barreiras')

    //Instanciar as duas barreiras
    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    //Colocar as duas barreiras criadas dentro do "novoElemento"
    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    //Função para sortear a localização das barreiras. Sempre mantendo uma abertura fixa
    this.sortearAbertura = () => {
        
        //Sorteia a altura da barreira superior
        const alturaSuperior = Math.random() * (altura - abertura)
        //Definir tamanho da barreira inferior
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    //Funções para simplificar, para lê de maneira mais fácil as informações do elemento criado.
    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth
    
    //Chamar a função para sortear a altura do elemento.
    this.sortearAbertura()
    //Definir a posição de X que o elemento vai aparecer
    this.setX(x)
}

// const b = new ParDeBarreiras(700, 200, 400)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function Barreiras(altura, largura, abertura, espaco, notificarPonto){
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            //Quando o elemento sair da tela do jogo
            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio
            if(cruzouOMeio) notificarPonto()
        })
    }
}

// function Passaro(alturaJogo) {
//     let voando = false

//     this.elemento = novoElemento('img', 'passaro')
//     this.elemento.src = 'imgs/passaro.png'

//     this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
//     this.setY = y => this.elemento.style.bottom = `${y}px`

//     window.onkeydown = e => voando = true
//     window.onkeyup = e => voando = false

//     this.animar = () => {
//         const novoY = this.getY() + (voando ? 8 : -5)
//         const alturaMaxima = alturaJogo - this.elemento.clientHeight

//         if (novoY <= 0) {
//             this.setY(0)
//         } else if (novoY >= alturaMaxima) {
//             this.setY(alturaMaxima)
//         } else {
//             this.setY(novoY)
//         }
//     }

//     this.setY(alturaJogo / 2)
// }

function Passaro(alturaJogo) {
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    //Saber a altura que o passaro está
    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    //setar a posição que o passarro está
    this.setY = y => this.elemento.style.bottom = `${y}px`

    //Eventos para quando o usuário clicar em qualquer tecla.
    //Usuário aperta
    window.onkeydown = e => voando = true
    //Usuário solta a tecla
    window.onkeyup = e => voando = false

    //Construir a animação do jogo
    this.animar = () => {
        //Se o passaro tiver vooando ele sobe 8, se não tiver desce 5.
        const novoY = this.getY() + (voando ? 8 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if(novoY <= 0){
            this.setY(0)
        }else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        }else {
            this.setY(novoY)
        }
    }
    //Setar o passaro no meio do jogo
    this.setY(alturaJogo / 2)
}

function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

//Função para as colisões
function estaoSobrepostos(elementoA, elementoB){
    //Pegar todas as dimensões do retangulo A e retangulo B.
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    //Teste para saber se há ou não sobreposição horizontal
    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top
    return horizontal && vertical
}

//Verificar se realmente o passaro colidiu com as barreiras
function colidiu(passaro, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras => {
        if (!colidiu) {
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior)
                || estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}

//Função para representar o jogo
function FlappyBird() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    //Pegar a altura do jogo
    const altura = areaDoJogo.clientHeight
    //Pegar a largura do jogo
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 220, 400,
    //Função para notificar os pontos
    () => progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)

    //Adicionar os elementos na tela do jogo
    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    //Iniciar o jogo
    this.start = () => {
        // loop do jogo
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if (colidiu(passaro, barreiras)) {
                clearInterval(temporizador)
                alert (`Final de jogo! Pontuação = ${pontos}`)
            }
        }, 20)
    }
}

new FlappyBird().start()
// const barreiras = new Barreiras(700, 1200, 200, 400)
// const passaro = new Passaro(700)
// const areaDoJogo = document.querySelector('[wm-flappy]')

// areaDoJogo.appendChild(passaro.elemento)
// barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
// setInterval(() => {
//     barreiras.animar()
//     passaro.animar()
// }, 20)