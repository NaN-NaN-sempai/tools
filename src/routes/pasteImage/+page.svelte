<script>
    let img;
    let output;

    const onPaste = function(e) {
        e.preventDefault();

        var data = e.clipboardData.items[0].getAsFile();
        
        var fr = new FileReader;
        
        fr.onloadend = function() {
            output.innerHTML=(fr.result);

            img.src = fr.result;
            img.style.display = "block";
        };
        
        fr.readAsDataURL(data);
    }
</script>

<div class="container">
    <h3>Paste Here</h3>
    <div class="block" contenteditable on:paste={onPaste}> Select this box and Paste an image </div>
    <h3>Base64</h3>
    <div id="output" class="block" contenteditable bind:this={output}> Base64 output will appear here </div>
    <h3>Image Output</h3>
    <div id="image" class="block"> 
        Image will appear here
        <img src="" alt="" bind:this={img}>    
    </div>
</div>


<style>
    .container {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 5px;
        align-items: center;
    }

    .block {
-webkit-box-sizing: border-box;
   -moz-box-sizing: border-box;
        box-sizing: border-box;
        width: 100%;
        padding: 10px;
        border: solid;
        border-radius: 10px;
        user-select: all;
    }
    #output {
        resize: vertical;
        max-height: 4rem;
        overflow-y: scroll;
    }
    #image {
        height: fit-content;

    } 
    #image img {
        margin: auto;
        min-width: 200px;
        max-width: 450px;
        margin-top: 20px;
    }
    img {display: none}
</style>