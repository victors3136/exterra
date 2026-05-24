import {RefreshCw} from "lucide-react";
import {Theme} from "../utils/Theme.js";

export default function RefreshButton(props) {
    return <button
        onClick={props.onClick}
        disabled={props.disabled}
        style={{
            backgroundColor: Theme.accent,
            color: Theme.text,
            border: 'none',
            fontWeight: "bold",
            padding: '8px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
        }}
    >
        <RefreshCw size={14} style={{animation: props.disabled ? 'spin 1s linear infinite' : 'none'}}/>
        Force Refresh
    </button>
}