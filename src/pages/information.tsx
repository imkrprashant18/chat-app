import { useState } from "react"
import MYQR from "./MyQR"
import Scanner from "./Scanner"

const InformationPage = () => {
        const [showScanner, setShowScanner] = useState(false)

        return (
                <div className="min-h-screen  bg-gradient-to-br from-blue-50 to-indigo-50 p-4 ">

                        <div className="w-full  flex justify-end">
                                <button
                                        onClick={() => setShowScanner(prev => !prev)}
                                        className="px-4 py-2 rounded-md  text-primary-foreground bg-blue-600 hover:bg-blue-400"
                                >
                                        {showScanner ? "Hide Scanner" : "Add Contact"}
                                </button>
                        </div>

                        {showScanner ? <Scanner /> : <MYQR />
                        }
                </div>
        )
}

export default InformationPage
