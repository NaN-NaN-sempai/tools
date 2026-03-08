import { ImageResponse } from '@vercel/og';



export async function GET({ url }) {
    const value = url.searchParams.get('value');

    const displayValue = value ? `R$ ${parseFloat(value).toFixed(2)}` : 'Valor a definir';
    let message = url.searchParams.get('name') || '';

	message = message? `~ ${message} ~`: '';


    const width = 996;
    const height = 523;

    let img ;

    console.log(((11 - displayValue.length) * 1 ));
    


	img = new ImageResponse(
		{
			type: 'div',
			props: {
				style: {
					width: `${width}px`,
					height: `${height}px`,
					backgroundImage:
						`url(${url.origin}/assets/publicShare/banner.png)`,
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'flex-end',
					fontFamily: "sans-serif",
				},
				children: [
					{
						type: "div",
						props: {
							style: {
								width: (width  * 0.538)+"px",
								height: "233px",
								marginRight: "22px",
								marginTop: "260px",
								display: 'flex',
								flexDirection: 'column',
								fontFamily: "sans-serif",
								justifyContent: message? 'space-between': 'center',
								alignItems: 'flex-end',
							},
							children: [
								{
									type: "span",
									props: {
										style: {
											color: "#1C1931",
											fontSize: Math.max(40, 155 - (displayValue.length * 6)) + "px",
											fontWeight: "bold",
											fontFamily: "sans-serif",
											textShadow: "0 0 2px #1C1931, 0 0 2px #1C1931, 0 0 2px #1C1931",
										},
										children: displayValue
									}
								},
								{
									type: "span",
									props: {
										style: {
											color: "#1C1931",
											fontSize: "3rem",
											fontWeight: "bold",
											lineHeight: ".9",
											textShadow: "0 0 2px #1C1931",
											padding: "10px",
											paddingTop: "0",
											borderRadius: "10px",
											textAlign: "right",
											fontFamily: "sans-serif",
											display: message? "block": "none",
										},
										children: message
									}
								},
							]
						}
					}
				]
			}
		},
		{ width, height, }
	);

    return img;
    
}