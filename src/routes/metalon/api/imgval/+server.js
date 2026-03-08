import { ImageResponse } from '@vercel/og';

export async function GET({ url }) {
    const font = await fetch(
    new URL('/fonts/inter.ttf', url.origin)
    ).then(r => r.arrayBuffer());

    const value = url.searchParams.get('value');

    const displayValue = value ? `R$ ${parseFloat(value).toFixed(2)}` : 'Valor a definir';
    const message = url.searchParams.get('message') || '';

    const width = 996;
    const height = 523;

    let img ;

    console.log(((11 - displayValue.length) * 1 ));
    

    if(!value && !message) {
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
                    },
                }
            },
            { width, height, fonts: [
    {
      name: "Inter",
      data: font
    }
  ] });

    } else {
        img = new ImageResponse(
            {
                type: 'div',
                props: {
                    style: {
                        width: `${width}px`,
                        height: `${height}px`,
                        backgroundImage:
                            `url(${url.origin}/assets/publicShare/banner w val.png)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
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
                                    justifyContent: message? 'space-between': 'center',
                                    alignItems: 'flex-end',
                                },
                                children: [
                                    {
                                        type: "span",
                                        props: {
                                            style: {
                                                color: "#E9773C",
                                                fontSize: Math.max(40, 155 - (displayValue.length * 6)) + "px",
                                                fontWeight: "bold",
                                                textShadow: "0 0 2px #E9773C, 0 0 2px #E9773C, 0 0 2px #E9773C",
                                            },
                                            children: displayValue
                                        }
                                    },
                                    {
                                        type: "span",
                                        props: {
                                            style: {
                                                color: "#E9773C",
                                                fontSize: "3rem",
                                                fontWeight: "bold",
                                                lineHeight: ".9",
                                                textShadow: "0 0 2px #E9773C",
                                                border: "6px solid #E9773C",
                                                padding: "10px",
                                                paddingTop: "0",
                                                borderRadius: "10px",
                                                textAlign: "right",
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
            { width, height, fonts: [
    {
      name: "Inter",
      data: font
    }
  ] }
        );
    }

    return img;
    
}