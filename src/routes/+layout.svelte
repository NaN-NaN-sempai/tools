<script>
    import { page } from '$app/stores';
	import favicon from '$lib/assets/faviconDark.png';
    import GoHomeIcon from '../components/goHomeIcon.svelte';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Luís Henrique Space - {$page.data.title? "Tools | " + $page.data.title : "Tools"}</title>
</svelte:head>

<header>
	<a class="goHome" href="/">
		<GoHomeIcon />
		<span>Check all tools</span>
	</a>

	<h1>Luís Henrique Space - {$page.data.title || 'Tools'}</h1>
</header>


<slot />


<style>
	:global(*) {
		font-family: sans-serif;
	}
	:global(body) {
		margin: 0;
	}
	header {
		text-align: center;
		height: 50px;
		background: #1c1931;
		margin: 0;
		color: white;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-inline: 10px;
		position: relative;
	}

	header h1 {
		text-align: center;
		margin: 0;
		font-size: 1.5em;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}

	@media (max-width: 600px) {
		header h1 {
			font-size: 1em;
			position: relative;
			left: 0;
			top: 0;
			transform: translate(0, 0);
		}
	}

	.goHome {
		height: 100%;
		box-sizing: border-box;
		text-decoration: none;
		color: inherit;
		padding-block: 10px;

		display: flex;
		justify-content: center;
		align-items: center;
		gap: 10px;

	}
	.goHome:visited {
		color: inherit;
	}
</style>
