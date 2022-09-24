import { useLayoutListener } from "../services/suggestText.utils"
import { listClassDef, layoutClasses } from "../services/suggestText.custom"


export function WrapperStyle({ className, children }) {
  return (<span className={`${layoutClasses.containerWrapper} ${className}`}>{children}</span>)
}

export function EntryStyle({ classes, isSelected, children, id }) {
  return (
  <li id={id} className={`${classes?.base ?? listClassDef.base} ${
    isSelected ? classes?.select ?? listClassDef.select : classes?.unselect ?? listClassDef.unselect
  }`}>
    {children}
  </li>
  )
}

export const HiddenList = ({ label }) => (
  <span className="hidden" aria-hidden="true" id={label+'-list'} />
)

const Ab = () => <span className="hidden" aria-hidden="true" /> // Absorb first/last child styling for input-group

export function ListStyle({ divRef, textbox, children, label, className = listClassDef.wrapper }) {

  // List width
  useLayoutListener(['resize'], () => {
    divRef.current.style.width = !textbox.current ? 'inherit' :
      `${textbox.current.offsetWidth - (layoutClasses.listSideInset * 2)}px`

    divRef.current.style.marginLeft = `${layoutClasses.listSideInset}px`
  }, [textbox.current?.offsetWidth])

  // List height
  useLayoutListener(['resize','scroll'], () => {
    if (divRef.current)
      divRef.current.style.maxHeight = `${
        divRef.current.getBoundingClientRect().bottom - layoutClasses.listTopMargin
      }px`
  }, [divRef.current?.getBoundingClientRect()?.bottom])  
  
  return (
    <div className={`${layoutClasses.listWrapper} ${className}`} ref={divRef}><Ab /> 
        <ul id={label+'-list'}><Ab />{children}<Ab /></ul>
    <Ab /></div>
  )
}
