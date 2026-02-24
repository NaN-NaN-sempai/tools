<script>
    import content from "./metalom.scad?raw";

    const copy = () => {
        navigator.clipboard.writeText(content);
        alert("Copiado!");
    }
</script>


<div class="output">
    <h1 class="highlight">Luis Henrique Space</h1>
    <h2 class="highlight">Metalom OpenSCAD Lib</h2>
    <button on:click={copy}>Copiar código</button>
    <pre>{content}</pre>
</div>

<style>
    h1, h2 {
        text-align: center;
        font-family: sans-serif;
        color: #1c1931;
        margin: 0;
        padding: 0;
    }
    button {
        display: block;
        margin: 20px auto;
        padding: 10px 20px;
        font-size: 1em;
        cursor: pointer;
        background: #1c1931;
        color: #dcdcdc;
        border: none;
        border-radius: 5px;
    }
    pre {
        background: #1c1931;
        color: #dcdcdc;
        padding: 1em;
        border-radius: 5px;
        overflow-x: auto;
    }
</style>