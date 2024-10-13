"use client"
import { books } from "@/constants/mockData"
import '@fortawesome/fontawesome-free/css/all.min.css'
import { motion } from 'framer-motion'
import { useParams, useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Editor, useDomValue } from "reactjs-editor"
import styles from './book.module.css'
import html2pdf from 'html2pdf.js'

type Book = {
   id: number
   title: string
   author: string
   content: string
}

export default function BookPage() {
   const { id } = useParams() as { id: string }
   const router = useRouter()
   const bookContentRef = useRef<HTMLDivElement | null>(null)

   const handleBackToMain = () => {
      router.push('/')
   }

   const { dom, setDom } = useDomValue()

   const selectedBook = books.filter((book: Book) => id === String(book.id))
   const notify = () => toast("Your changes have been saved!")

   const handleSave = () => {
      if (dom && selectedBook.length > 0) {
         const updatedDomValue = {
            key: dom?.key,
            props: dom?.props,
            ref: dom?.ref,
            type: dom?.type,
         }
         localStorage.setItem(`dom${selectedBook[0].id}`, JSON.stringify(updatedDomValue))
         notify()
      }
   }

   const handleDownload = () => {
      const element = bookContentRef.current

      if (element && selectedBook.length > 0) {
         const opt = {
            margin: [0.5, 0.5],
            filename: `${selectedBook[0].title}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
               scale: 2,
               useCORS: true,
               height: element.scrollHeight,
            },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
         }
         html2pdf().from(element).set(opt).save()
      }
   }

   useEffect(() => {
      if (selectedBook.length > 0) {
         const savedDom = localStorage.getItem(`dom${selectedBook[0].id}`)
         if (savedDom) {
            setDom(JSON.parse(savedDom))
         }
      }
   }, [id, setDom, selectedBook])

   if (selectedBook.length === 0) return <p>Book not found</p>

   return (
      <motion.div transition={{ type: 'spring', damping: 40, mass: 0.75 }}
         initial={{ opacity: 0, x: 1000 }} animate={{ opacity: 1, x: 0 }}>
         <motion.section transition={{ type: 'spring', damping: 44, mass: 0.75 }}
            initial={{ opacity: 0, y: -1000 }} animate={{ opacity: 1, y: 0 }} className={styles.appBar}>
            <div className={styles.leftIcons}>
               <i onClick={handleBackToMain} style={{ fontSize: '20px', cursor: 'pointer' }} className="fas fa-chevron-left"></i>
            </div>
            <div className={styles.title}><h2 className={styles.titleStyles}>{selectedBook[0].title}</h2></div>
            <div className={styles.icons}>
               <button className={styles.saveButton} onClick={handleSave}>Save</button>
               <i style={iconStyle} className="fas fa-download" onClick={handleDownload}></i>
               <i style={iconStyle} className="fas fa-cog"></i>
               <i style={iconStyle} className="fas fa-share"></i>
               <i style={iconStyle} className="fas fa-search"></i>
            </div>
         </motion.section>

         <div ref={bookContentRef} className={styles.bookContainer}>
            <Editor
               htmlContent={`<main className="bookContent">
                     <aside>
                        <h1 className="center">${selectedBook[0].title}</h1>
                        <span className="center small">By ${selectedBook[0].author}</span>
                        <div className="bookText">${selectedBook[0].content}</div>
                     </aside>
                  </main>`}
            />
         </div>

         <ToastContainer />
      </motion.div>
   )
}

const iconStyle: React.CSSProperties = { marginRight: '20px', fontSize: '20px' }
