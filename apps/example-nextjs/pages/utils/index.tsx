import { utils } from '@litprotocol/utils';

const Utils = () => {

    const tests = [
        {
            domId: 'utils-function',
            onClick: utils,
            btnText: 'utils()',
        },
    ];

    return (
        <>
            <h1>This page is used to test the Utils package</h1>
            {
                tests.map((btn, i) => 
                    <div key={i}>
                        <button id={btn.domId} onClick={btn.onClick}>{btn.btnText}</button><br/>
                    </div>
                )
            }
        </>
    )
}
export default Utils;