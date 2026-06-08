import {AnimatePresence, motion} from "framer-motion"

const AnimationTab = ({activeKey, tabKey,children}) => {
  return (
    <AnimatePresence mode ="wait">
        {
            activeKey ===tabKey &&(
                <motion.div
                key={tabKey}
                initial={{opacity: 0,x: -50}}
                animate= {{opacity:1,x:0}}
                exit = {{opacity: 0,x: 50}}
                transition ={{duration: 0.4}}
                >
                    {children}
                </motion.div>
            )
        }
    </AnimatePresence>
  );
}

export default AnimationTab
