<script>
    import { onMount, tick } from "svelte";
    

    import LZString from "lz-string";
    import Lhs from "./partners/lhs.svelte";
    import Mr from "./partners/mr.svelte";
    export let data;
    

    let input;
    let metric = 6;
    let price;

    let info = {};
    let list = [];

    let met = [];
    let metaQnt = [];
    let metaQntCeil = [];

    let pric = [];

    const savedPrices = {
        "2 x 2": 40,
    };


    let form;
    let formObject = {};

    async function displayInfo(infoObj){
        formObject = Object.fromEntries(new FormData(form));

        info = infoObj?.sizes !== undefined ?
            infoObj :
            gatherInfo(typeof infoObj == "string" ? infoObj : input.value);

        console.log(info);
        

        await tick();
        
        notesTextareaChange();

        countUntilNext();
        
        formObject = Object.fromEntries(new FormData(form));

        info.totalPrice = 0;
        info.sum?.forEach((e,i)=>{
            const price = formObject["price "+e.type] || info.sizes[i]?.price || 0;
            const qnt = Math.ceil((e.length/100)/6);
            info.totalPrice += price * qnt;
        });
    }

    let detailedListMini = [];
    let detailedList = [];
    const countUntilNext = () => {
        detailedList = [];
        let auxList = [];

        const add = (item, query) => {
            detailedList.push(item);

            if(query) query.qnt += 1;
            else auxList.push(item);
        }

        [...(info?.metalomList || []), ...(info?.woodList || []), ...(info?.titleList || [])]
        .sort((a, b) => a[a.length - 1] - b[b.length - 1])
        .forEach(item => {
            if(item.length == 2) {
                detailedListMini = [...detailedListMini, ...auxList];
                auxList = [];

                const query = detailedListMini.filter(e=>
                    e.type == "title" &&
                    e?.text?.startsWith(item[0])
                );

                let text = item[0] + ((query && query.length) ? ` - ${query.length+1}` : "");

                const obj = {
                    text,
                    type: "title",
                };

                detailedList.push(obj);
                detailedListMini.push(obj);

            } else if(item[0].split(" x ").length == 2) {
                const query = auxList.find(e=> 
                    e.type == "metalon" &&
                    e.dimension == item[0] &&
                    e.length == item[1]
                );

                add({
                    dimension: item[0],
                    length: item[1],
                    qnt: 1,
                    type: "metalon"
                }, query);

            } else {
                const query = auxList.find(e=> 
                    e.type == "madeira" &&
                    e.dimension == item[0]
                );

                add({
                    dimension: item[0],
                    qnt: 1,
                    type: "madeira"
                }, query);
            }
        });

        if(auxList.length) detailedListMini = [...detailedListMini, ...auxList];
    }

    let useCuttingStock = false;
    function cuttingStockMetalon(pieces) {
        let allPieces = [];
        pieces.forEach(p => {
            for(let i=0;i<p.qnt;i++) allPieces.push(p.length);
        });

        allPieces.sort((a,b)=>b-a);

        let minMetalons = allPieces.length;

        function search(index, bins) {
            if(index === allPieces.length){
                minMetalons = Math.min(minMetalons, bins.length);
                return;
            }

            const piece = allPieces[index];

            for(let i=0;i<bins.length;i++){
                if(bins[i] + piece <= metric * 100){
                    bins[i] += piece;
                    search(index+1, bins);
                    bins[i] -= piece;
                }
            }

            bins.push(piece);
            search(index+1, bins);
            bins.pop();
        }

        search(0, []);

        return minMetalons;
    }

    function gatherInfo(str){

        let sizes =[];
        let sum = [];
        let metAmt = [];
        let woodSizes = [];

        let titleList = [];
        let metalomList = [];
        let woodList = [];
        
        
        if(str){        

            const patternize = ([type, length], i) => {
                length = parseFloat(length);
                type = type
                    .split(' x ')
                    .map(Number)
                    .sort((a, b) => a - b)
                    .join(' x ');

                return [type, length, i];
            }

            str.split("\n").filter(e=>e).forEach((e,i)=>{
                let split = e.slice(12,-1).split(" => ");

                if (e.includes("met.")) {
                    const data = e.slice(12,-1).split(" => ");
                    const patternized = patternize(data, i);
                    metalomList.push(patternized);
                } 
                else if (e.includes("mad.")) {
                    const data = e.slice(12,-1).split(" => ");
                    const patternized = patternize(data, i);
                    woodList.push(patternized);
                }
                else if (e.includes("title.")) {
                    const data = e.slice(13,-1)
                    titleList.push([data, i]);
                }
            });
            
            metalomList.forEach(([type, length])=>{
                let typeQuery = sizes.find(e=>e.type == type);

                if(!typeQuery) sizes.push({type, sizes: [],
                    price: formObject["price "+type] || savedPrices[type] || savedPrices["2 x 2"]});

                const item = sizes.find(e=>e.type == type);
                const query = item.sizes.find(e=>e.length == length);
                
                if(query) query.qnt += 1;
                else item.sizes.push({qnt: 1, length});
            });

            sizes.forEach(e=>{
                let total = 0;
                
                e.sizes.forEach(e=>total += e.qnt * e.length);
                sum.push({type: e.type, length: total});
            });
            
            metAmt = useCuttingStock?
            sizes.map(e => ({
                type: e.type,
                metalons: cuttingStockMetalon(e.sizes)
            })) :
            sizes.map(e => {
                let allPieces = [];
                e.sizes.forEach(s => {
                    for(let i = 0; i < s.qnt; i++) allPieces.push(s.length);
                });
                
                allPieces.sort((a,b) => b-a);

                let metalons = [];

                allPieces.forEach(p => {
                    let placed = false;
                    for(let i=0; i<metalons.length; i++){
                        if(metalons[i] + p <= metric * 100){
                            metalons[i] += p;
                            placed = true;
                            break;
                        }
                    }
                    if(!placed) metalons.push(p);
                });
                
                return { type: e.type, metalons: metalons.length };
            });
            
            woodList.forEach(([type, length])=>{
                let typeQuery = woodSizes.find(e=>e.type == type);

                if(!typeQuery) woodSizes.push({type, qnt: 1});
                else typeQuery.qnt += 1;                
            });
        } else {
            sizes = info.sizes || [];
            sum = info.sum || [];
            metAmt = info.metAmt || [];
            woodSizes = info.woodSizes || [];   

            titleList = info.titleList || [];
            metalomList = info.metalomList || [];
            woodList = info.woodList || [];
        }
        
        




        let tintasPrice = 0;

        (tintas || []).forEach(e=>{
            tintasPrice += e.price * e.qnt;
        });

        let adicionaisPrice = 0;
        (adicionais || []).forEach(e=>{
            adicionaisPrice += e.price;
        });

        return {
            sum, metAmt, sizes, woodSizes, tintasPrice, adicionaisPrice,
            titleList, metalomList, woodList,
        }

    }


    const toggleInputArea = () => {
        inputAreaVisible = !inputAreaVisible;
        window.scrollTo(0, 0);
    }


    let tintas = [
        {
            name: "Preto Fosco",
            qnt: 1,
            price: 100
        }
    ];
    const addTinta = () => {
        tintas.push({
            name: "Preto Fosco",
            qnt: 1,
            price: 100
        });

        displayInfo();

        tintas = tintas;   
    }
    const removeTinta = (index) => {
        tintas.splice(index, 1);
        tintas = tintas;

        displayInfo();
    }


    let adicionais = [];
    let adicionaisCounter = 0;
    const addAdicional = () => {
        let c = adicionaisCounter++;

        adicionais.push({
            name: "Mão de obra" + (c? " " + c : ""),
            price: 100
        });

        displayInfo();

        adicionais = adicionais;   
    }
    const removeAdicional = (index) => {
        adicionais.splice(index, 1);
        adicionais = adicionais;

        displayInfo();
    }


    let orderNotes = "";
    let notesTextarea;
    const notesTextareaChange = () => {    
        notesTextarea.style.height = "auto";
        notesTextarea.style.height = notesTextarea.scrollHeight + 3 + "px";
    }


    let infoName;
    let savedOrders = [];
    const gatherOrder = () => {
        return {
            info,
            tintas,
            name: infoName.value,
            notes: orderNotes,
            adicionais,
            metric
        };
    }
    const saveOrder = () => {
        const saveObj = gatherOrder();
        
        savedOrders = JSON.parse(localStorage.getItem("savedOrders") || "[]");

        if(!infoName.value){
            return alert("Insira um nome para o orçamento!");
        }

        if(savedOrders.find(e=>e.name == infoName.value)){
            savedOrders = savedOrders.map(e=>{
                if(e.name == infoName.value) return saveObj;
                return e;
            });

            alert("Orçamento '" + infoName.value + "' atualizado com sucesso!");

        } else {
            savedOrders.push(saveObj);

            alert("Orçamento '" + infoName.value + "' salvo com sucesso!");
        }

        localStorage.setItem("savedOrders", JSON.stringify(savedOrders));

        window.location.search = `order=${infoName.value}`;
    }
    const loadOrderObj = obj => {
        info = obj.info;
        tintas = obj.tintas;
        infoName.value = obj.name;
        adicionais = obj.adicionais;
        metric = obj.metric;
        orderNotes = obj.notes;

        displayInfo(obj.info);

        const url = new URL(window.location);
        url.searchParams.set("order", obj.name);

        window.history.replaceState({}, "", url);
    }

    const loadOrder = (e) => {
        let localSave = JSON.parse(localStorage.getItem("savedOrders") || "[]");

        const order = localSave[e.target.value];

        if(!order) return alert("Nenhum orçamento encontrado!");

        loadOrderObj(order);
    }

    const shareOrder = () => {
        const obj = gatherOrder();

        const totalValue = 
            (info?.totalPrice || 0) +
            (info?.tintasPrice || 0) + 
            (info?.adicionaisPrice || 0);

        navigator.share({
            title: "Luís Henrique Space - Tools | Orçamento Metalon",
            url: window.location.href.split("?")[0] + `?shared=${LZString.compressToEncodedURIComponent(JSON.stringify(obj))}&name=${obj.name}&value=${totalValue}`
        })
        
    }

    const print = () => {
        let setInptarea = false;
        if(inputAreaVisible){
             inputAreaVisible = false;
             setInptarea = true;
        }
        setTimeout(() => {

            window.print();

            if(setInptarea) inputAreaVisible = true;
        }, 200)
    }

    let inputAreaVisible = true;
    let displayLists = false;
    let expandList = false;
    let minimizeDetailedList = true;
    onMount(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const order = urlParams.get("order");
        const shared = urlParams.get("shared");
        const overwrite = urlParams.get("overwrite");

        if(overwrite){
            const text = decodeURI(overwrite);

            console.log(text);
            

            return displayInfo(text);
        }



        savedOrders = JSON.parse(localStorage.getItem("savedOrders") || "[]");
        
        inputAreaVisible = false;

        let query;
        if(shared) {
            query = JSON.parse(LZString.decompressFromEncodedURIComponent(shared));
            
        } else {
            query = savedOrders.find(e=>e.name == order);
        }

        if(!query) return inputAreaVisible = true;

        loadOrderObj(query);
    });


    const orderMadeira = () => {
        const number = "+55 74 8116-4671";

        const listStr = info.woodSizes.map(({type, qnt}, i) => 
            `- *${qnt}* und : \`${type} cm\``
        ).join("\n");

        const message = "> *Orçamento de madeira*:\n" + listStr;

        window.open(`https://api.whatsapp.com/send?phone=${number}&text=${encodeURIComponent(message)}`);
    }
</script>


<svelte:head>
	<meta property="og:title" content="Luís Henrique Space - Tools | Metalon">
    <meta property="og:description" content="Ferramenta para orçamentos de metalon - Luís Henrique Space | Tools">
	<meta property="og:image" content="https://pay.luishenrique.space/api/imgval/tools-metalon?o={Date.now().toString(36)}&{data.value? "value=" + data.value + "&" : ""}{data.name? "name=" + data.name : ""}">
</svelte:head>


<div class="pageContainer">

    <form class="container" on:submit|preventDefault bind:this={form}>
    
        <div class="inputArea" class:visible={!inputAreaVisible}>
            <h1>Orçamento</h1>
            <h2>~ {infoName?.value || "Novo Orçamento"} ~</h2>
            
            <h4>
                <button on:click={shareOrder}>compartilhar</button>
                <button on:click={print}>Imprimir</button>
            </h4>
    
            <br><br>
        </div>
    
        <div class="inputArea" class:visible={inputAreaVisible}>
            <h3>Nome do Orçamento : </h3>
            <input type="text" bind:this={infoName} />
            <button on:click={saveOrder}>salvar</button>
            <br>
            
            <label> Carregar Orçamento :
                <select on:change={loadOrder}>
                    <option value="">Nenhum</option>
                    {#each savedOrders as order, index}
                        <option value={index}>{order.name}</option>
                    {/each}
                </select>
            </label>
            <br><br>
    
            <label> Compartilhar Orçamento :
                <button on:click={shareOrder}>compartilhar</button>
            </label>
            <br>
            <label> Imprimir Orçamento :
                <button on:click={print}>Imprimir</button>
            </label>
            <br><hr>
    
            <h3>Codigo <a href="https://openscad.org/">OpenSCAD</a> / <a href="https://github.com/NaN-NaN-sempai/SpaceSCAD">SpaceSCAD</a> :</h3>
            <label>
                <input type="checkbox" bind:checked={useCuttingStock}>
                <small> Usar <strong>cutting stock</strong> - metalon (mais pesado) </small>
            </label>
            <textarea class="input" placeholder="ex:
            ECHO: 'met. 2 x 2 => 59.5'
            ECHO: 'met. 2 x 2 => 59.5'" bind:this={input} on:input={displayInfo}>{1? "":`PRATELEIRA JANELA
        ECHO: "met. 20 x 20 => 170"
        ECHO: "met. 20 x 20 => 170"
        ECHO: "met. 20 x 20 => 30"
        ECHO: "met. 20 x 20 => 170"
        ECHO: "met. 20 x 20 => 170"
        ECHO: "met. 20 x 20 => 30"
        ECHO: "mad. 224 x 30 x 2"
        ECHO: "mad. 224 x 30 x 2"`}</textarea>
            <br><br>
    
            <h3>Metragem Metalon :</h3>
            <input class="input metric" type="number" min="1" bind:value={metric} on:input={displayInfo}/>
            <br><br>
    
            <h3>Preço Metalon :</h3>
            {#each (info.sizes || []) as item}
                <h4>{item.type}</h4>
                <input class="input" type="number" name="price {item.type}" placeholder="preço {item.type}" bind:value={item.price} on:input={displayInfo}/>
            {:else}
                <h4>Aguardando dados...</h4>
            {/each}
            <br>
            <br>
    
            <h3>Tintas :</h3>
            <button on:click={addTinta}>Adicionar tinta</button>
            {#each tintas as tinta, index}
                <br>
                <br>
                <input type="text" id="tinta_{index}" bind:value={tinta.name} placeholder="Nome da tinta">
                <br>
                <input type="number" id="tinta_{index}_qnt" bind:value={tinta.qnt} on:input={displayInfo} placeholder="Quantidade">
                <br>
                <input type="number" id="tinta_{index}_price" bind:value={tinta.price} on:input={displayInfo} placeholder="Preço">
                <br>
                <button on:click={() => removeTinta(index)}>remover</button>
            {:else}
            <h4>Sem tintas...</h4>
            {/each}
            <br>
            <br>
    
            <h3>Adicionais :</h3>
            <button on:click={addAdicional}>Adicionar adicional</button>
            {#each adicionais as item, index}
                <br>
                <br>
                <input type="text" id="adc_{index}" bind:value={item.name} placeholder="Nome do adicional">
                <br>
                <input type="number" id="adc_{index}_price" bind:value={item.price} on:input={displayInfo} placeholder="Preço">
                <br>
                <button on:click={() => removeAdicional(index)}>remover</button>
            {:else}
            <h4>Sem adicionais...</h4>
            {/each}
            <br>
            <br>
    
            <br>
    
            <hr>
        </div>
    
        <div class="output">
            <div class="spliter">
                <div class="outputContainer">
                    <h3>Preço Total :</h3>
                        <p>
                            Total =
                            <span class="highlight total"> R$ {(
                                (info?.totalPrice || 0) +
                                (info?.tintasPrice || 0) + 
                                (info?.adicionaisPrice || 0)
                            )?.toFixed(2)}</span>
                        </p>
                        
                        {#if info?.totalPrice}
                        <p class="metalon">
                            <span class="highlight">Metalon</span>
                            =
                            <span class="highlight price">R$ {info?.totalPrice?.toFixed(2)}</span>
                        </p>
                        {/if}
    
                        {#if info?.tintasPrice}
                        <p class="tintas">
                            <span class="highlight">Tintas</span>
                            =
                            <span class="highlight price">R$ {info?.tintasPrice?.toFixed(2)}</span>
                        </p>
                        {/if}
    
                        {#if info?.adicionaisPrice}
                        {#each adicionais as item}
                            <p  class:madeira={item.name.toLowerCase().includes("madeira")}
                                class:metalon={item.name.toLowerCase().includes("metalon")}
                                class="adicionais">
                                +
                                <span class="highlight">{item.name}</span>
                                =
                                <span class="highlight price">R$ {(item.price || 0).toFixed(2)}</span>
                            </p>
                            
                        {/each}
                        {/if}
                        
    
                    <div class="outputContainer">
                        <h3>Notas : </h3>
                        <p>
                            <textarea placeholder="Notas gerais sobre o orcamento..."
                                readonly={!inputAreaVisible}
                                style:resize={inputAreaVisible ? "vertical" : "none"}
                                bind:value={orderNotes}
                                on:input={notesTextareaChange}
                                bind:this={notesTextarea}></textarea>
                        </p>
                    </div>
                </div>
            </div>
        </div> 
        
        <hr>
    
    

        <div class="output"
        >

            {#if info.sum != undefined}
                <div class="spliter">
    
                    <div class="outputContainer">
                        <h3>Preço Metalon :</h3>
                        <p class="metalon">
                            Total =
                            <span class="highlight total"> R$ {info?.totalPrice?.toFixed(2)}</span>
                        </p>
                        {#each info.sum as {type, length}}
                            <p class="metalon">
                                <span class="highlight">{info.metAmt.find(e=>e.type == type)?.metalons}</span>
                                und 
                                <span class="highlight">{type}</span> =
                                <span class="highlight price"> R$ {(Math.ceil((length/100)/metric) * formObject["price "+type]).toFixed(2)}</span>
                            </p>
                        {:else}
                            <p class="metalon"><i><small>Sem metalons...</small></i></p>
                        {/each}
                    </div>
    
                    <div class="outputContainer">
                        <h3> Preço Tintas : </h3>
                        <p class="tintas">
                            Total =
                            <span class="highlight total"> R$ {info?.tintasPrice?.toFixed(2)}</span>
                        </p>
                        {#each tintas as {qnt, name, price}}
                        <p class="tintas">
                            <span class="highlight">{qnt}</span>
                            und 
                            <span class="highlight">{name}</span>
                            =
                            <span class="highlight price">R$ {((qnt*price) || 0).toFixed(2)}</span>
                        </p>
                        {:else}
                            <p class="tintas"><i><small>Sem tintas...</small></i></p>
                        {/each}
                    </div>
                    
                    
                    <div class="outputContainer">
                        <h3> Adicionais : </h3>
                        <p class="adicionais">
                            Total =
                            <span class="highlight total"> R$ {(info?.adicionaisPrice || 0).toFixed(2)}</span>
                        </p>
                        {#each adicionais as {name, price}}
                        <p class="adicionais">
                            <span class="highlight">{name}</span>
                            =
                            <span class="highlight price">R$ {(price || 0).toFixed(2)}</span>
                        </p>
                        {:else}
                            <p class="adicionais"><i><small>Sem adicionais...</small></i></p>
                        {/each}
                    </div>
                    <hr>
                    <div class="outputContainer" class:hidden={displayLists}>

                        <h3>Materiais Avulso :</h3>
                        <p>
                            <button on:click={() => displayLists = true}>Expandir Listas</button>
                        </p>
                    </div>
                </div>
    
                <div class="spliter"
                    class:hidden={!displayLists}>

                    <div class="outputContainer">
                        
                        <h3>Materiais Avulso :</h3>
                        <p>
                            <button on:click={() => displayLists = false}>Recolher Listas</button>
                        </p>
                    </div>

                
                    <div class="outputContainer">
                        <h3>Quantidade Metalon :</h3>
                        {#each info.sum as {type, length}}
                            <p class="metalon">
                                <span class="highlight">{type}</span>
                                =
                                <span class="highlight">{(length/100).toFixed(2)}m</span>
                                |
                                <span class="highlight">{info.metAmt.find(e=>e.type == type)?.metalons}</span>
                                und
                                <span class="highlight"> <small>≈ {((length/100)/metric).toFixed(2)}</small></span>
                            </p>
                        {:else}
                            <p class="metalon"><i>Aguardando dados...</i></p>
                        {/each}
                    </div>
    
                    <div class="outputContainer">
                        <h3>Lista Metalon :</h3>
                        {#each info.sizes as {type, sizes}}
                        {#each sizes as {qnt, length}}
                        <p class="metalon">
                            <span class="highlight">{qnt}</span>
                            und =
                            <span class="highlight">
                                {type.split(' x ')[0]}
                                <small>x</small>
                                {type.split(' x ')[1]}
                            </span>
                            x
                            <span class="highlight">{length}</span>
                            cm
                        </p>
                        
                        {/each}
                        {:else}
                            <p class="metalon"><i>Aguardando dados...</i></p>
                        {/each}
                    </div>
    
                    <div class="outputContainer">
                        <h3>Lista Madeira :</h3>
                        {#if info.woodSizes && inputAreaVisible }
                            <p class="madeira">
                                <button class="whatsapp" on:click={orderMadeira}>Orçar Madeiras</button>
                            </p>
                        {/if}
                        {#each info.woodSizes as {qnt, type}}
                        <p class="madeira">
                            <span class="highlight">{qnt}</span>
                            und =
                            <span class="highlight">
                                {type.split(' x ')[0]}
                                <small>x</small>
                                {type.split(' x ')[1]}
                                <small>x</small>
                                {type.split(' x ')[2]}
                            </span>
                            cm
                        </p>
                        {:else}
                            <p class="madeira"><i>Aguardando dados...</i></p>
                        {/each}
                    </div>
                    
                    <hr>                
                </div>
                
            {/if}
    
        </div>

        <hr>

        <div class="output">
            {#if info.sum != undefined}
                <div class="spliter">
                    <div class="outputContainer">
                        <h3>Materiais por Peça :</h3>
                        <p>
                            <button on:click={() => expandList = !expandList}>
                                {expandList ? "Recolher" : "Expandir"} Lista
                            </button>

                            {#if expandList }
                                <button on:click={() => minimizeDetailedList = !minimizeDetailedList}>
                                    {minimizeDetailedList ? "☰" : "∑"}
                                </button>
                            {/if}
                        </p>
                        <div style:display={expandList ? "block" : "none"}>
                            {#each minimizeDetailedList ? detailedListMini : detailedList as item}
                                {#if item.type != "title"}      
                                    <p
                                        class:metalon={item.type == "metalon"}
                                        class:madeira={item.type == "madeira"}
                                    >
                                        {#if minimizeDetailedList}
                                        <small class="highlight">
                                            {item.qnt}
                                        </small>
                                        -
                                        {/if}
                                        <span class="highlight">
                                            {item.type == "metalon" ? "Metalon" : "Madeira"}
                                        </span>
                                        :
                                        <span class="highlight">
                                            {item.dimension}
                                        </span>
                                        {#if item.type == "metalon"}
                                            x
                                            <span class="highlight">
                                                {item.length}
                                            </span>    
                                        {/if}
                                        cm
                                    </p>
                                {:else}
                                    <p class="title">
                                        Titulo: <span class="highlight">{item.text}</span>
                                    </p>
                                {/if}
                            {:else}
                                <p>
                                    lista não encontrada
                                </p>
                            {/each}
                        </div>
                        
                    </div>
                </div>
            {/if}
        </div>
            
        <hr>
        <div class="output">
            
                <div class="spliter">

                    <div class="outputContainer">
                        <p>
                            <button on:click={toggleInputArea}>
                                {inputAreaVisible ? "Recolher" : "Expandir"} menu de entradas
                            </button>
                        </p>
                    </div>
                </div>  
        </div>
    </form>
    
    
    <footer>
        <h3>Desenvolvido por:</h3>

        <div class="partners">
            <a href="https://resume.luishenrique.space/">
                <Lhs/>
            </a>
            <a href="https://www.instagram.com/mr_metalurgicapnz/">
                <Mr/>
            </a>
        </div>
    </footer>
</div>

<style>
.container * {margin: 0; padding: 0; font-family: sans-serif}

.spliter.hidden, .outputContainer.hidden {
    display: none;
}

.pageContainer {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100vh;
}

footer {
    text-align: center;
    padding: 10px;
    background: #1c1931;
    color: white;
}

footer .partners {
    height: fit-content;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: center;
    gap: 30px;
    padding-bottom: 65px;
}
footer .partners a {
    max-height: 100px;
    background: transparent;
    border-radius: 5px;
    padding: 5px;
    transition: .2s;
}
footer .partners a:hover {
    background: #fff2;
}


button {
    padding: 0 4px !important;
    margin: 2px 0 !important;
    border-radius: 4px;
    font-size: 1em;
    background: #1c1931;
    color: white;
    border: none;
    cursor: pointer;
}

button.whatsapp::before {
    content: "\f232";
    font-family: "Font Awesome 6 Brands";
    margin-right: 5px;
}

button.whatsapp {
    background: #25d366;
    color: white;
    border: 2px solid #fff;
}

.output p.metalon {
    background: rgba(0, 0, 0, 0.48);
    color: white;
}

.output p.title {
    background: rgba(0, 0, 0, 0.8);
    color: white;
}
.output p.title .highlight {
    color: black;
}

.output p.tintas {
    background: #a24ead91;
}

.output p.adicionais {
    background: #328cd56e;
}

.output p.madeira {
    background: #8f57096e;
}

.inputArea {
    display: none;
}
.inputArea.visible {
    display: block;
    
    box-sizing: border-box;
    max-width: 800px;
    margin: auto;
}
.container {
    padding: 30px;
}
.input {
    width: 100%;
    padding-inline: 5px;
    box-sizing: border-box;
}
h3, h1, h2, h4, p {text-align:center}

textarea {
    resize: vertical;
    min-height: 2rem;
}

hr {
    margin: 20px !important;
    border: none;
    border-top: 1px solid black;
}
.output p {
	background: rgba(0,0,0,.1);
    margin-inline: 0px;
    border-radius: 5px;
    padding: 10px;
	width: auto;
    margin-bottom: 5px;
}
.output p textarea {
    width: 100%;
    outline: none;
    border: none;
    background: transparent;
    text-align: center;
}
.output .highlight {
    background: rgba(255, 255, 255, 0.8);
    border-radius: 10px;
    padding: 1px 7px;
    color: rgb(0, 194, 237);
    font-weight: bold;
}
.output .highlight.price {
    color: #5fac00;
}
.output .highlight.total {
    color: #16A34A;
}

.output {
    display: flex;
    flex-direction: row;
    gap: 10px;
    box-sizing: border-box;
    max-width: 700px;
    margin: auto;
}

.output .spliter {
    width: 100%;
}
.spliter hr {
    opacity: .3;
}

.output .outputContainer h3 {
    margin-top: 15px;
}


@media screen and (max-width: 700px) {
    .output {
        flex-direction: column;
        gap: 0;
    }    
}

@media print {
    footer h3,
    button,
    p:has(button),
    hr {
        display: none;
    }

    footer {
        position: absolute;
        top: 0;
        width: 100%;
        
    }
    footer .partners {
        padding: 10px;
    }
    .container {
        margin-top: 100px;
    }
}
</style>
