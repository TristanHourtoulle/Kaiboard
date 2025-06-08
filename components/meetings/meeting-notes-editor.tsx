'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Color from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import {
	Bold,
	Italic,
	Underline as UnderlineIcon,
	Strikethrough,
	Code,
	AlignLeft,
	AlignCenter,
	AlignRight,
	AlignJustify,
	List,
	ListOrdered,
	Quote,
	Undo,
	Redo,
	Link as LinkIcon,
	Image as ImageIcon,
	Table as TableIcon,
	Palette,
	Type,
	Highlighter,
	Save,
	FileText,
	Download
} from 'lucide-react'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'

interface MeetingNotesEditorProps {
	meetingId: string
	initialContent?: string
	onSave?: (content: string) => void
	meetingTitle?: string
}

interface LastEditor {
	id: string
	name: string | null
	email: string | null
}

export function MeetingNotesEditor({ meetingId, initialContent = '', onSave, meetingTitle = 'Meeting Notes' }: MeetingNotesEditorProps) {
	const [isSaving, setIsSaving] = useState(false)
	const [lastSaved, setLastSaved] = useState<Date | null>(null)
	const [linkUrl, setLinkUrl] = useState('')
	const [imageUrl, setImageUrl] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [lastEditor, setLastEditor] = useState<LastEditor | null>(null)
	const [isDownloading, setIsDownloading] = useState(false)
	const contentRef = useRef<HTMLDivElement>(null)

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: {
					levels: [1, 2, 3, 4, 5, 6],
				},
			}),
			Underline,
			TextAlign.configure({
				types: ['heading', 'paragraph'],
			}),
			Highlight.configure({ multicolor: true }),
			Color.configure({ types: [TextStyle.name] }),
			TextStyle,
			FontFamily.configure({
				types: [TextStyle.name],
			}),
			Image.configure({
				allowBase64: true,
			}),
			Link.configure({
				openOnClick: false,
				HTMLAttributes: {
					class: 'text-blue-600 underline hover:text-blue-800',
				},
			}),
			Table.configure({
				resizable: true,
			}),
			TableRow,
			TableHeader,
			TableCell,
		],
		content: initialContent,
		editorProps: {
			attributes: {
				class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none focus:outline-none min-h-[400px] p-4',
			},
		},
		onUpdate: ({ editor }) => {
			// Auto-save functionality
			if (onSave) {
				const content = editor.getHTML()
				// Debounce auto-save
				setTimeout(() => {
					onSave(content)
				}, 1000)
			}
		},
	})

	// Load existing notes when component mounts
	useEffect(() => {
		const loadNotes = async () => {
			try {
				setIsLoading(true)
				const response = await fetch(`/api/meetings/${meetingId}/notes`)
				
				if (response.ok) {
					const data = await response.json()
					if (data.notes && editor) {
						editor.commands.setContent(data.notes.content)
						setLastSaved(new Date(data.notes.updatedAt))
						setLastEditor(data.notes.lastEditor)
					}
				}
			} catch (error) {
				console.error('Error loading notes:', error)
				toast.error('Failed to load existing notes')
			} finally {
				setIsLoading(false)
			}
		}

		if (meetingId && editor) {
			loadNotes()
		}
	}, [meetingId, editor])

	const saveNotes = useCallback(async () => {
		if (!editor) return

		setIsSaving(true)
		try {
			const content = editor.getHTML()
			
			const response = await fetch(`/api/meetings/${meetingId}/notes`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ content }),
			})

			if (!response.ok) {
				throw new Error('Failed to save notes')
			}

			const data = await response.json()
			setLastSaved(new Date())
			setLastEditor(data.notes.lastEditor)
			toast.success('Meeting notes saved successfully')
			
			if (onSave) {
				onSave(content)
			}
		} catch (error) {
			console.error('Error saving notes:', error)
			toast.error('Failed to save meeting notes')
		} finally {
			setIsSaving(false)
		}
	}, [editor, meetingId, onSave])

	const downloadAsPDF = useCallback(async () => {
		if (!editor) return

		setIsDownloading(true)
		try {
			// Create an isolated iframe for PDF generation to avoid CSS conflicts
			const iframe = document.createElement('iframe')
			iframe.style.position = 'absolute'
			iframe.style.left = '-9999px'
			iframe.style.width = '800px'
			iframe.style.height = '600px'
			iframe.style.border = 'none'
			document.body.appendChild(iframe)

			const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
			if (!iframeDoc) {
				throw new Error('Could not access iframe document')
			}

			// Get the editor content and clean it thoroughly
			let cleanContent = editor.getHTML()
			
			// Debug: log the original content
			console.log('Original HTML content:', cleanContent.substring(0, 200))
			
			// Decode HTML entities that might affect spacing
			cleanContent = cleanContent
				.replace(/&nbsp;/g, ' ')
				.replace(/&amp;/g, '&')
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>')
				.replace(/&quot;/g, '"')
			
			// Clean problematic CSS colors and properties more precisely
			cleanContent = cleanContent
				// Replace color functions in style attributes
				.replace(/style="([^"]*?)oklch\([^)]+\)([^"]*?)"/gi, (match, before, after) => {
					const cleanedStyle = (before + after).replace(/;\s*;/g, ';').replace(/^;|;$/g, '')
					return cleanedStyle ? `style="${cleanedStyle}"` : ''
				})
				.replace(/style="([^"]*?)hsl\(var\(--[^)]+\)[^)]*\)([^"]*?)"/gi, (match, before, after) => {
					const cleanedStyle = (before + after).replace(/;\s*;/g, ';').replace(/^;|;$/g, '')
					return cleanedStyle ? `style="${cleanedStyle}"` : ''
				})
				.replace(/style="([^"]*?)var\(--[^)]+\)([^"]*?)"/gi, (match, before, after) => {
					const cleanedStyle = (before + after).replace(/;\s*;/g, ';').replace(/^;|;$/g, '')
					return cleanedStyle ? `style="${cleanedStyle}"` : ''
				})
				.replace(/style="([^"]*?)rgb\(var\(--[^)]+\)[^)]*\)([^"]*?)"/gi, (match, before, after) => {
					const cleanedStyle = (before + after).replace(/;\s*;/g, ';').replace(/^;|;$/g, '')
					return cleanedStyle ? `style="${cleanedStyle}"` : ''
				})
				.replace(/style="([^"]*?)rgba\(var\(--[^)]+\)[^)]*\)([^"]*?)"/gi, (match, before, after) => {
					const cleanedStyle = (before + after).replace(/;\s*;/g, ';').replace(/^;|;$/g, '')
					return cleanedStyle ? `style="${cleanedStyle}"` : ''
				})
				.replace(/style="([^"]*?)hsla\(var\(--[^)]+\)[^)]*\)([^"]*?)"/gi, (match, before, after) => {
					const cleanedStyle = (before + after).replace(/;\s*;/g, ';').replace(/^;|;$/g, '')
					return cleanedStyle ? `style="${cleanedStyle}"` : ''
				})
				// Remove empty style attributes
				.replace(/\s*style=""\s*/gi, ' ')
				// Clean up any remaining problematic color functions in inline styles
				.replace(/color:\s*oklch\([^)]+\);?/gi, 'color: #333333;')
				.replace(/color:\s*var\([^)]+\);?/gi, 'color: #333333;')
				.replace(/background-color:\s*oklch\([^)]+\);?/gi, 'background-color: transparent;')
				.replace(/background-color:\s*var\([^)]+\);?/gi, 'background-color: transparent;')
			
			// Debug: log the cleaned content
			console.log('Cleaned HTML content:', cleanContent.substring(0, 200))
			
			// Final cleanup - be very gentle with space normalization
			cleanContent = cleanContent.trim()

			// Create completely isolated HTML with inline styles only
			const htmlContent = `
				<!DOCTYPE html>
				<html>
				<head>
					<meta charset="utf-8">
					<style>
						* {
							margin: 0;
							padding: 0;
							box-sizing: border-box;
							color: #333333 !important;
							background: transparent !important;
							border: none !important;
							font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif !important;
							word-spacing: normal !important;
							letter-spacing: normal !important;
							white-space: normal !important;
						}
						body {
							background: #ffffff !important;
							color: #333333 !important;
							line-height: 1.6 !important;
						}
						.pdf-container {
							padding: 40px !important;
							background: #ffffff !important;
							width: 100% !important;
						}
						.pdf-header {
							border-bottom: 2px solid #e5e7eb !important;
							padding-bottom: 20px !important;
							margin-bottom: 30px !important;
						}
						.pdf-title {
							font-size: 24px !important;
							font-weight: 700 !important;
							color: #111827 !important;
							margin: 0 !important;
						}
						.pdf-meta {
							color: #6b7280 !important;
							font-size: 14px !important;
							margin: 10px 0 0 0 !important;
						}
						.pdf-content {
							font-size: 16px !important;
							line-height: 1.6 !important;
							color: #333333 !important;
						}
						h1 { font-size: 32px !important; color: #111827 !important; margin: 24px 0 16px 0 !important; font-weight: 700 !important; word-spacing: normal !important; letter-spacing: normal !important; }
						h2 { font-size: 28px !important; color: #111827 !important; margin: 20px 0 12px 0 !important; font-weight: 600 !important; word-spacing: normal !important; letter-spacing: normal !important; }
						h3 { font-size: 24px !important; color: #111827 !important; margin: 16px 0 8px 0 !important; font-weight: 600 !important; word-spacing: normal !important; letter-spacing: normal !important; }
						h4 { font-size: 20px !important; color: #111827 !important; margin: 12px 0 8px 0 !important; font-weight: 600 !important; word-spacing: normal !important; letter-spacing: normal !important; }
						h5 { font-size: 18px !important; color: #111827 !important; margin: 12px 0 4px 0 !important; font-weight: 600 !important; word-spacing: normal !important; letter-spacing: normal !important; }
						h6 { font-size: 16px !important; color: #111827 !important; margin: 8px 0 4px 0 !important; font-weight: 600 !important; word-spacing: normal !important; letter-spacing: normal !important; }
						p { margin: 12px 0 !important; color: #333333 !important; word-spacing: normal !important; letter-spacing: normal !important; }
						ul, ol { margin: 12px 0 !important; padding-left: 24px !important; color: #333333 !important; }
						li { margin: 4px 0 !important; color: #333333 !important; }
						blockquote { 
							border-left: 4px solid #3b82f6 !important; 
							padding: 16px !important; 
							margin: 16px 0 !important; 
							background: #f8fafc !important; 
							color: #374151 !important;
							font-style: italic !important;
						}
						code { 
							background: #f3f4f6 !important; 
							color: #1f2937 !important; 
							padding: 2px 4px !important; 
							border-radius: 4px !important;
							font-family: 'Courier New', monospace !important;
						}
						pre { 
							background: #f3f4f6 !important; 
							color: #1f2937 !important; 
							padding: 16px !important; 
							border-radius: 8px !important; 
							margin: 16px 0 !important;
							overflow-x: auto !important;
						}
						pre code { 
							background: transparent !important; 
							padding: 0 !important; 
						}
						table { 
							border-collapse: collapse !important; 
							width: 100% !important; 
							margin: 16px 0 !important; 
							border: 1px solid #d1d5db !important;
						}
						th, td { 
							border: 1px solid #d1d5db !important; 
							padding: 8px 12px !important; 
							text-align: left !important;
							color: #333333 !important;
						}
						th { 
							background: #f9fafb !important; 
							font-weight: 600 !important; 
							color: #111827 !important;
						}
						a { 
							color: #3b82f6 !important; 
							text-decoration: underline !important; 
						}
						strong, b { 
							font-weight: 700 !important; 
							color: #111827 !important; 
						}
						em, i { 
							font-style: italic !important; 
						}
						u { 
							text-decoration: underline !important; 
						}
						s { 
							text-decoration: line-through !important; 
						}
						mark { 
							background: #fef3c7 !important; 
							color: #92400e !important; 
							padding: 2px 4px !important;
						}
						img {
							max-width: 100% !important;
							height: auto !important;
							margin: 16px 0 !important;
						}
					</style>
				</head>
				<body>
					<div class="pdf-container">
						<div class="pdf-header">
							<h1 class="pdf-title">${meetingTitle}</h1>
							<p class="pdf-meta">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
							${lastEditor ? `<p class="pdf-meta">Last edited by: ${lastEditor.name || lastEditor.email}</p>` : ''}
						</div>
						<div class="pdf-content">
							${cleanContent}
						</div>
					</div>
				</body>
				</html>
			`

			// Write the HTML to the iframe
			iframeDoc.open()
			iframeDoc.write(htmlContent)
			iframeDoc.close()

			// Wait for the iframe to load
			await new Promise(resolve => {
				if (iframe.contentWindow) {
					iframe.contentWindow.addEventListener('load', resolve)
				} else {
					setTimeout(resolve, 100)
				}
			})

			// Get the document body for canvas generation
			const targetElement = iframeDoc.body
			if (!targetElement) {
				throw new Error('Could not find target element in iframe')
			}

			// Convert to canvas
			const canvas = await html2canvas(targetElement, {
				scale: 2,
				useCORS: true,
				allowTaint: true,
				backgroundColor: '#ffffff',
				logging: false,
				width: 800,
				height: targetElement.scrollHeight,
				windowWidth: 800,
				windowHeight: targetElement.scrollHeight
			})

			// Calculate PDF dimensions
			const imgWidth = 210 // A4 width in mm
			const pageHeight = 295 // A4 height in mm
			const imgHeight = (canvas.height * imgWidth) / canvas.width
			let heightLeft = imgHeight

			const pdf = new jsPDF('p', 'mm', 'a4')
			let position = 0

			// Add the image to PDF
			pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight)
			heightLeft -= pageHeight

			// Add new pages if content is longer than one page
			while (heightLeft >= 0) {
				position = heightLeft - imgHeight
				pdf.addPage()
				pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight)
				heightLeft -= pageHeight
			}

			// Clean up
			document.body.removeChild(iframe)

			// Save the PDF
			const fileName = `${meetingTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes_${new Date().toISOString().split('T')[0]}.pdf`
			pdf.save(fileName)

			toast.success('PDF downloaded successfully')
		} catch (error) {
			console.error('Error generating PDF:', error)
			toast.error('Failed to generate PDF')
		} finally {
			setIsDownloading(false)
		}
	}, [editor, meetingTitle, lastEditor])

	// Add keyboard shortcuts for saving and PDF download
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key === 's') {
				event.preventDefault()
				saveNotes()
			}
			if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
				event.preventDefault()
				downloadAsPDF()
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [saveNotes, downloadAsPDF])

	const setLink = useCallback(() => {
		if (!editor) return

		if (linkUrl === '') {
			editor.chain().focus().extendMarkRange('link').unsetLink().run()
			return
		}

		editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
		setLinkUrl('')
	}, [editor, linkUrl])

	const addImage = useCallback(() => {
		if (!editor || imageUrl === '') return

		editor.chain().focus().setImage({ src: imageUrl }).run()
		setImageUrl('')
	}, [editor, imageUrl])

	const insertTable = useCallback(() => {
		if (!editor) return
		editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
	}, [editor])

	const colors = [
		'#000000', '#374151', '#6B7280', '#9CA3AF',
		'#EF4444', '#F97316', '#EAB308', '#22C55E',
		'#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4'
	]

	const fontFamilies = [
		{ value: 'Inter', label: 'Inter' },
		{ value: 'system-ui', label: 'System' },
		{ value: 'serif', label: 'Serif' },
		{ value: 'monospace', label: 'Monospace' },
		{ value: 'cursive', label: 'Cursive' },
	]

	if (!editor || isLoading) {
		return (
			<Card>
				<CardContent className="p-8 text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
					<p className="mt-2 text-muted-foreground">
						{!editor ? 'Loading editor...' : 'Loading notes...'}
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<TooltipProvider>
			<Card className="w-full">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<FileText className="w-5 h-5 text-primary" />
							<CardTitle>Meeting Notes</CardTitle>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button variant="ghost" size="sm" className="h-6 w-6 p-0">
										<span className="text-xs">?</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent side="bottom" className="max-w-xs">
									<div className="space-y-1 text-xs">
										<p><strong>Keyboard Shortcuts:</strong></p>
										<p>• <kbd>Ctrl+B</kbd> - Bold</p>
										<p>• <kbd>Ctrl+I</kbd> - Italic</p>
										<p>• <kbd>Ctrl+U</kbd> - Underline</p>
										<p>• <kbd>Ctrl+Z</kbd> - Undo</p>
										<p>• <kbd>Ctrl+Y</kbd> - Redo</p>
										<p>• <kbd>Ctrl+S</kbd> - Save</p>
										<p>• <kbd>Ctrl+P</kbd> - Download PDF</p>
									</div>
								</TooltipContent>
							</Tooltip>
						</div>
						<div className="flex items-center gap-2">
							{lastSaved && (
								<div className="text-sm text-muted-foreground">
									<div>Last saved: {lastSaved.toLocaleTimeString()}</div>
									{lastEditor && (
										<div className="text-xs">
											by {lastEditor.name || lastEditor.email}
										</div>
									)}
								</div>
							)}
							<Button 
								onClick={downloadAsPDF} 
								disabled={isDownloading || !editor} 
								variant="outline" 
								size="sm"
							>
								<Download className="w-4 h-4 mr-2" />
								{isDownloading ? 'Generating...' : 'Download PDF'}
							</Button>
							<Button onClick={saveNotes} disabled={isSaving} size="sm">
								<Save className="w-4 h-4 mr-2" />
								{isSaving ? 'Saving...' : 'Save Notes'}
							</Button>
						</div>
					</div>
				</CardHeader>
			<CardContent className="p-0">
				{/* Toolbar */}
				<div className="border-b p-4 space-y-2">
					{/* First row - Basic formatting */}
					<div className="flex items-center gap-1 flex-wrap">
						<Button
							variant={editor.isActive('bold') ? 'default' : 'ghost'}
							size="sm"
							onClick={() => editor.chain().focus().toggleBold().run()}
						>
							<Bold className="w-4 h-4" />
						</Button>
						<Button
							variant={editor.isActive('italic') ? 'default' : 'ghost'}
							size="sm"
							onClick={() => editor.chain().focus().toggleItalic().run()}
						>
							<Italic className="w-4 h-4" />
						</Button>
						<Button
							variant={editor.isActive('underline') ? 'default' : 'ghost'}
							size="sm"
							onClick={() => editor.chain().focus().toggleUnderline().run()}
						>
							<UnderlineIcon className="w-4 h-4" />
						</Button>
						<Button
							variant={editor.isActive('strike') ? 'default' : 'ghost'}
							size="sm"
							onClick={() => editor.chain().focus().toggleStrike().run()}
						>
							<Strikethrough className="w-4 h-4" />
						</Button>
						<Button
							variant={editor.isActive('code') ? 'default' : 'ghost'}
							size="sm"
							onClick={() => editor.chain().focus().toggleCode().run()}
						>
							<Code className="w-4 h-4" />
						</Button>
						
						<Separator orientation="vertical" className="h-6" />
						
						{/* Text alignment */}
						<Button
							variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
							size="sm"
							onClick={() => editor.chain().focus().setTextAlign('left').run()}
						>
							<AlignLeft className="w-4 h-4" />
						</Button>
						<Button
							variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
							size="sm"
							onClick={() => editor.chain().focus().setTextAlign('center').run()}
						>
							<AlignCenter className="w-4 h-4" />
						</Button>
						<Button
							variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
							size="sm"
							onClick={() => editor.chain().focus().setTextAlign('right').run()}
						>
							<AlignRight className="w-4 h-4" />
						</Button>
						<Button
							variant={editor.isActive({ textAlign: 'justify' }) ? 'default' : 'ghost'}
							size="sm"
							onClick={() => editor.chain().focus().setTextAlign('justify').run()}
						>
							<AlignJustify className="w-4 h-4" />
						</Button>
						
						<Separator orientation="vertical" className="h-6" />
						
						{/* Lists */}
						<Button
							variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
							size="sm"
							onClick={() => editor.chain().focus().toggleBulletList().run()}
						>
							<List className="w-4 h-4" />
						</Button>
						<Button
							variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
							size="sm"
							onClick={() => editor.chain().focus().toggleOrderedList().run()}
						>
							<ListOrdered className="w-4 h-4" />
						</Button>
						<Button
							variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
							size="sm"
							onClick={() => editor.chain().focus().toggleBlockquote().run()}
						>
							<Quote className="w-4 h-4" />
						</Button>
						
						<Separator orientation="vertical" className="h-6" />
						
						{/* Undo/Redo */}
						<Button
							variant="ghost"
							size="sm"
							onClick={() => editor.chain().focus().undo().run()}
							disabled={!editor.can().chain().focus().undo().run()}
						>
							<Undo className="w-4 h-4" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => editor.chain().focus().redo().run()}
							disabled={!editor.can().chain().focus().redo().run()}
						>
							<Redo className="w-4 h-4" />
						</Button>
					</div>
					
					{/* Second row - Advanced formatting */}
					<div className="flex items-center gap-2 flex-wrap">
						{/* Headings */}
						<Select
							value={
								editor.isActive('heading', { level: 1 }) ? '1' :
								editor.isActive('heading', { level: 2 }) ? '2' :
								editor.isActive('heading', { level: 3 }) ? '3' :
								editor.isActive('heading', { level: 4 }) ? '4' :
								editor.isActive('heading', { level: 5 }) ? '5' :
								editor.isActive('heading', { level: 6 }) ? '6' :
								'p'
							}
							onValueChange={(value) => {
								if (value === 'p') {
									editor.chain().focus().setParagraph().run()
								} else {
									editor.chain().focus().toggleHeading({ level: parseInt(value) as any }).run()
								}
							}}
						>
							<SelectTrigger className="w-32">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="p">Paragraph</SelectItem>
								<SelectItem value="1">Heading 1</SelectItem>
								<SelectItem value="2">Heading 2</SelectItem>
								<SelectItem value="3">Heading 3</SelectItem>
								<SelectItem value="4">Heading 4</SelectItem>
								<SelectItem value="5">Heading 5</SelectItem>
								<SelectItem value="6">Heading 6</SelectItem>
							</SelectContent>
						</Select>
						
						{/* Font Family */}
						<Select
							onValueChange={(value) => {
								if (value === 'unset') {
									editor.chain().focus().unsetFontFamily().run()
								} else {
									editor.chain().focus().setFontFamily(value).run()
								}
							}}
						>
							<SelectTrigger className="w-32">
								<SelectValue placeholder="Font" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="unset">Default</SelectItem>
								{fontFamilies.map((font) => (
									<SelectItem key={font.value} value={font.value}>
										{font.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						
						{/* Text Color */}
						<Popover>
							<PopoverTrigger asChild>
								<Button variant="ghost" size="sm">
									<Palette className="w-4 h-4 mr-2" />
									<Type className="w-4 h-4" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-64">
								<div className="grid grid-cols-4 gap-2 p-2">
									{colors.map((color) => (
										<button
											key={color}
											className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400"
											style={{ backgroundColor: color }}
											onClick={() => editor.chain().focus().setColor(color).run()}
										/>
									))}
								</div>
								<Button
									variant="outline"
									size="sm"
									className="w-full mt-2"
									onClick={() => editor.chain().focus().unsetColor().run()}
								>
									Remove Color
								</Button>
							</PopoverContent>
						</Popover>
						
						{/* Highlight */}
						<Popover>
							<PopoverTrigger asChild>
								<Button variant="ghost" size="sm">
									<Highlighter className="w-4 h-4" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-64">
								<div className="grid grid-cols-4 gap-2 p-2">
									{colors.map((color) => (
										<button
											key={color}
											className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400"
											style={{ backgroundColor: color }}
											onClick={() => editor.chain().focus().setHighlight({ color }).run()}
										/>
									))}
								</div>
								<Button
									variant="outline"
									size="sm"
									className="w-full mt-2"
									onClick={() => editor.chain().focus().unsetHighlight().run()}
								>
									Remove Highlight
								</Button>
							</PopoverContent>
						</Popover>
						
						<Separator orientation="vertical" className="h-6" />
						
						{/* Link */}
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant={editor.isActive('link') ? 'default' : 'ghost'}
									size="sm"
								>
									<LinkIcon className="w-4 h-4" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-80">
								<div className="space-y-2">
									<Label htmlFor="link-url">Link URL</Label>
									<Input
										id="link-url"
										value={linkUrl}
										onChange={(e) => setLinkUrl(e.target.value)}
										placeholder="https://example.com"
									/>
									<div className="flex gap-2">
										<Button onClick={setLink} size="sm">
											Add Link
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => editor.chain().focus().unsetLink().run()}
										>
											Remove Link
										</Button>
									</div>
								</div>
							</PopoverContent>
						</Popover>
						
						{/* Image */}
						<Popover>
							<PopoverTrigger asChild>
								<Button variant="ghost" size="sm">
									<ImageIcon className="w-4 h-4" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-80">
								<div className="space-y-2">
									<Label htmlFor="image-url">Image URL</Label>
									<Input
										id="image-url"
										value={imageUrl}
										onChange={(e) => setImageUrl(e.target.value)}
										placeholder="https://example.com/image.jpg"
									/>
									<Button onClick={addImage} size="sm">
										Add Image
									</Button>
								</div>
							</PopoverContent>
						</Popover>
						
						{/* Table */}
						<Button variant="ghost" size="sm" onClick={insertTable}>
							<TableIcon className="w-4 h-4" />
						</Button>
					</div>
				</div>
				
				{/* Editor Content */}
				<div className="min-h-[400px]" ref={contentRef}>
					<EditorContent editor={editor} />
				</div>
			</CardContent>
		</Card>
		</TooltipProvider>
	)
} 