import {Radio} from "lucide-react";
import RefreshButton from "./RefreshButton.jsx";
import {Theme} from "../utils/Theme.js";

export default function Header(props) {
    return <header style={{
        background: Theme.main,
        color: Theme.text,
        padding: '15px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <Radio style={{color: Theme.accent}}/>
            <h1 style={{margin: 0, fontSize: '1.25rem', fontWeight: 'bold'}}>exterra</h1>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '15px', fontSize: '0.875rem'}}>
            {props.lastUpdated && <span style={{color: Theme.text}}>Sync: {props.lastUpdated}</span>}
            <RefreshButton onClick={props.onClick} disabled={props.disabled}/>
        </div>
    </header>
}