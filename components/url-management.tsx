'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UrlItem } from '../types/url-item'

export default function UrlManagement() {
    const [urls, setUrls] = useState<UrlItem[]>([])
    const [newUrl, setNewUrl] = useState('')
    const [newDescription, setNewDescription] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const fetchUrls = async () => {
        try {
            const response = await fetch(`/api/get-urls?search=${searchTerm}`)
            const data = await response.json()
            setUrls(data)
        } catch (error) {
            console.error('Failed to fetch URLs:', error)
        }
    }

    useEffect(() => {
        fetchUrls()
    }, [searchTerm])

    const handleCommentChange = async (id: string, isCommented: boolean) => {
        try {
            await fetch('/api/comment-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isCommented }),
            })
            fetchUrls()
        } catch (error) {
            console.error('Failed to update comment status:', error)
        }
    }

    const handleAddUrl = async () => {
        try {
            await fetch('/api/add-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: newUrl, description: newDescription }),
            })
            setNewUrl('')
            setNewDescription('')
            setIsDialogOpen(false)
            fetchUrls()
        } catch (error) {
            console.error('Failed to add new URL:', error)
        }
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <Input
                    placeholder="搜索 URL 或描述"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                <div className="space-x-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>新增 URL</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>添加新的 URL</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="url" className="text-right">
                                        URL
                                    </Label>
                                    <Input
                                        id="url"
                                        value={newUrl}
                                        onChange={(e) => setNewUrl(e.target.value)}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="description" className="text-right">
                                        描述
                                    </Label>
                                    <Input
                                        id="description"
                                        value={newDescription}
                                        onChange={(e) => setNewDescription(e.target.value)}
                                        className="col-span-3"
                                    />
                                </div>
                            </div>
                            <Button onClick={handleAddUrl}>确定</Button>
                        </DialogContent>
                    </Dialog>
                    <Button onClick={fetchUrls}>刷新</Button>
                </div>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">是否注释</TableHead>
                        <TableHead>URL 地址</TableHead>
                        <TableHead>URL 描述</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {urls.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <Checkbox
                                    checked={item.isCommented}
                                    onCheckedChange={(checked) => handleCommentChange(item.id, checked as boolean)}
                                />
                            </TableCell>
                            <TableCell>{item.url}</TableCell>
                            <TableCell>{item.description}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

