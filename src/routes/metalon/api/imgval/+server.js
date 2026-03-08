export function GET({ url }) {
	const value = url.searchParams.get('value');
	let message = url.searchParams.get('name') || '';

    message = message? message : 'Novo Orcamento';

	const displayValue = value
		? `R$ ${parseFloat(value).toFixed(2)}`
		: 'R$ 0.00';

	const width = 996;
	const height = 523;

    const priceSize = Math.max(40, 155 - (displayValue.length * 6));
    const messageSize = Math.max(25, 80 - (message.length * 2));

	const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
	<image href="${url.origin}/assets/publicShare/banner w val.png" width="100%" height="100%"/>
	
	<text
		x="70%"
		y="85%"
	    text-anchor="middle"
		font-size="${priceSize}"
        font-family="Arial"
		font-weight="bold"
		fill="#1c1931"
	>
		${displayValue}
	</text>

	${
		message
			? `<text
                x="70%"
                y="60%"
	text-anchor="middle"
                font-size="${messageSize}"
                font-family="Arial"
                font-weight="bold"
                fill="#1c1931"
			>~ ${message} ~</text>`
			: ''
	}
</svg>
`;

	return new Response(svg, {
		headers: {
			'Content-Type': 'image/svg+xml'
		}
	});
}