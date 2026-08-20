# 🖨️ PrintStream 3D — Gestão de Fila e Projetos de Impressão 3D

> Sistema completo e moderno para gerenciamento de filas de impressão 3D, controle de projetos em lote, monitoramento de frota de impressoras (Creality K1 Max, Bambu Lab H2D, Ultimaker 2), controle de carretéis de filamento e relatórios analíticos de produção com custos e rastreabilidade por data/hora.

---

## 🎯 Por que o PrintStream 3D foi criado?

Em ambientes industriais, laboratoriais e corporativos com restrições de rede ou isolamento de equipamentos (Air-gapped), o envio automático de arquivos diretamente para as impressoras via IoT/Cloud nem sempre é viável.

O **PrintStream 3D** padroniza a operação através de um fluxo inteligente:
1. **Fatiamento Único**: O projetista ou engenheiro fatia a peça uma única vez no fatiador (OrcaSlicer, Bambu Studio, Cura) e faz o upload do `.gcode` ou `.3mf` pronto na fila.
2. **Download Direto para Pendrive/SD**: Qualquer operador da equipe pode acessar a fila, verificar qual impressora está livre, baixar o arquivo original com 1 clique e iniciar a máquina sem precisar re-fatiar modelos repetidamente.
3. **Rastreabilidade e Custos**: Registra exatamente quem imprimiu, data e hora de envio/conclusão, filamento gasto e custo acumulado por projeto.

---

## ✨ Principais Funcionalidades

### 1. 📋 Gestão Dinâmica da Fila de Impressão
* **Upload e Download Direto**: Suporte nativo para `.stl`, `.gcode`, `.3mf`, `.obj` e `.step`.
* **Visualizador 3D WebGL (Three.js)**: Renderização 3D interativa de modelos em cada cartão com a cor do filamento selecionado.
* **Priorização Inteligente**: Reordene trabalhos com prioridades *Urgente*, *Alta*, *Normal* ou *Baixa*.
* **Exclusão Segura com Confirmação Inline**: Botão com duplo clique protegido para evitar exclusões acidentais sem depender de pop-ups bloqueados.
* **Filtros e Busca**: Busque por título, cliente, material ou projeto vinculado.

### 2. 📁 Gestão de Projetos & Lotes de Peças
* **Cadastro Estruturado**: Atribua responsável pelo projeto, cliente/departamento, prazos, especificações de material e cores exigidas.
* **Controle de Múltiplos Tipos de Peças**: Cadastre peças distintas e quantidades solicitadas (ex: 6 braços mecânicos, 1 chassi central, 4 suportes).
* **Disparo em Lote para a Fila**: Botão *"Enviar Peças para a Fila"* que gera automaticamente os trabalhos individuais com numeração de cópias (ex: *Cópia 1/6*).

### 3. 🤖 Monitoramento da Frota de Impressoras (Modo Operacional Offline)
* Perfis pré-configurados:
  * **Creality K1 Max** (CoreXY High-Speed / Klipper — 300x300x300 mm)
  * **Bambu Lab H2D** (CoreXY Multi-Material — 256x256x256 mm)
  * **Ultimaker 2** (Bowden Precision FDM — 223x223x205 mm)
* **Temperaturas Alvo do Fatiamento**: Exibe os valores recomendados de Bico (*Nozzle*) e Mesa (*Bed*) como guia para o operador na máquina.
* **Status em Tempo Real**: *Livre*, *Em Uso / Imprimindo*, *Pausada* e *Modo Manutenção*.
* **Estimativa de Término**: Cronômetro de tempo decorrido e restante.

### 4. 🧵 Estoque de Filamentos
* Gerenciamento de carretéis por marca, tipo de polímero (**PLA, PETG, ABS, TPU, ASA, Nylon**) e amostra de cor hexadecimal.
* Barra de gramatura restante com alerta automático de estoque baixo (< 150g).
* Desconto automático do peso do carretel ao concluir impressões.

### 5. 💰 Calculadora de Custos de Impressão 3D
* **Fórmula de Orçamento Completa**:
  $$\text{Custo Total} = \text{Material (R\$/g)} + \text{Consumo Elétrico (kWh)} + \text{Depreciação/Hora Máquina} + \text{Buffer de Falha (\%)} + \text{Margem de Lucro (\% validations)}$$
* Geração de preço final de venda sugerido para o cliente.

### 6. 📊 Analytics & Relatórios Individuais com Data/Hora
* **Seletor de Relatório**: Alterne entre a *Visão Geral da Frota* e *Relatórios Analíticos por Projeto*.
* **Rastreabilidade Temporal**: Registro de **Data/Hora de Envio** e **Data/Hora de Conclusão** formatados em PT-BR (`DD/MM/AAAA, HH:MM`).
* **Exportação em PDF**: Botão integrado para gerar documento analítico para impressão ou arquivamento.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend**: React 19, Vite
* **Estilização**: Tailwind CSS v4 (Light Mode com paleta Slate/Blue)
* **Computação Gráfica 3D**: Three.js (WebGL Canvas)
* **Ícones**: Lucide React
* **Persistência de Dados**: RAM Cache + IndexedDB + LocalStorage (100% offline no navegador)
* **Tipografia**: Google Fonts (*Plus Jakarta Sans*, *Sora*, *Fira Code*)

---

## 🚀 Como Executar Localmente

### Pré-requisitos
* **Node.js** (versão 18 ou superior)
* **npm** ou **yarn**

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/eliasdopontiac/fila-de-impressao.git
cd fila-de-impressao
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse no navegador:
```
http://localhost:3000
```

---

## 📦 Build para Produção

Para gerar o pacote otimizado e minificado para deploy:
```bash
npm run build
```
Os arquivos prontos serão gerados na pasta `dist/`.

---

## 📄 Licença

Este projeto está sob a licença **MIT** — sinta-se livre para usar, modificar e distribuir.

Desenvolvido para otimizar o fluxo de manufatura aditiva e prototipagem 3D. 🚀
