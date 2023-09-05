import React from "react"

const TabWrapperStyle = (props) => (
    <div className="tabs m-2" {...props} /> 
)

const TabStyle = ({ selected, children, ...props }) => (
    <button className={`tab tab-bordered${selected ? ' tab-active' : ''}`} {...props}>
        <h3 className="text-xl">{children}</h3>
    </button>
)

export default function Tabs({ labels, value, onChange }) {
    return (
        <TabWrapperStyle>
            {labels.map((label, idx) =>
                <TabStyle key={label} selected={value === idx} onClick={() => onChange(idx)}>
                    {label}
                </TabStyle>
            )}
        </TabWrapperStyle>
    )
}