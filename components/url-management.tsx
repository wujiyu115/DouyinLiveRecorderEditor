'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UrlItem } from '../types/url-item'
import { Recording } from '../types/recording'
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const urlOptions = [
    { label: "抖音", value: "https://live.douyin.com/" },
    { label: "无", value: "none" }
]

export default function UrlManagement() {
    const [urls, setUrls] = useState<UrlItem[]>([])
    const [newUrl, setNewUrl] = useState('')
    const [newDescription, setNewDescription] = useState('')
    const [selectedUrlOption, setSelectedUrlOption] = useState(urlOptions[0].value)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isModifyDialogOpen, setIsModifyDialogOpen] = useState(false)
    const [modifyingUrl, setModifyingUrl] = useState<UrlItem | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentSearchTerm, setCurrentSearchTerm] = useState('')
    const [recordings, setRecordings] = useState<Recording[]>([])

    const { toast } = useToast()

    const fetchUrls = async (clearSearch: boolean = false) => {
        try {
            const response = await fetch(`/api/get-urls?search=${currentSearchTerm}`)
            const data = await response.json()
            setUrls(data)
            if (clearSearch) {
                setSearchTerm('')
                setCurrentSearchTerm('')
            }
        } catch (error) {
            console.error('Failed to fetch URLs:', error)
        }
    }

    const fetchRecordings = async () => {
        try {
            const response = await fetch('/api/fetch-recordings')
            const data = await response.json()
            setRecordings(data.recordings || [])
        } catch (error) {
            console.error('Failed to fetch recordings:', error)
        }
    }

    useEffect(() => {
        fetchUrls()
        fetchRecordings()

        const interval = setInterval(fetchRecordings, 5000)
        return () => clearInterval(interval)
    }, [currentSearchTerm])

    const handleCommentChange = async (id: string, isCommented: boolean) => {
        try {
            const response = await fetch('/api/comment-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isCommented }),
            })

            if (!response.ok) {
                toast({
                    title: 'update failed',
                    description: 'update failed',
                    variant: 'destructive',
                })
                return
            }

            const data = await response.json()

            if (data.code !== 0) {
                toast({
                    title: 'update failed',
                    description: 'update failed',
                    variant: 'destructive',
                })
                return
            }
            console.log('comment successfully:')
            toast({
                title: "Success",
                description: "comment successfully",
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
            toast({
                title: "Success",
                description: "add-url successfully",
            })
            setNewUrl('')
            setNewDescription('')
            setSelectedUrlOption(urlOptions[0].value)
            handleUrlOptionChange(urlOptions[0].value)
            setIsDialogOpen(false)
            fetchUrls()
        } catch (error) {
            console.error('Failed to add new URL:', error)
        }
    }

    const handleDeleteUrl = async (id: string) => {
        try {
            await fetch('/api/delete-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            })
            fetchUrls()
            toast({
                title: "成功",
                description: "URL已删除",
            })
        } catch (error) {
            console.error('Failed to delete URL:', error)
            toast({
                title: "错误",
                description: "删除URL失败",
                variant: "destructive",
            })
        }
    }

    const handleModifyUrl = async () => {
        if (!modifyingUrl) return

        try {
            await fetch('/api/modify-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: modifyingUrl.id,
                    url: modifyingUrl.url,
                    description: modifyingUrl.description,
                }),
            })
            setIsModifyDialogOpen(false)
            setModifyingUrl(null)
            fetchUrls()
            toast({
                title: "成功",
                description: "URL已修改",
            })
        } catch (error) {
            console.error('Failed to modify URL:', error)
            toast({
                title: "错误",
                description: "修改URL失败",
                variant: "destructive",
            })
        }
    }

    const handleSearch = () => {
        setCurrentSearchTerm(searchTerm)
    }

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const handleUrlOptionChange = (value: string) => {
        setSelectedUrlOption(value)
        setNewUrl(value)
    }

    useEffect(() => {
        handleUrlOptionChange(selectedUrlOption);
    }, [selectedUrlOption]);

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                    <Input
                        placeholder="搜索 URL 或描述"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyUp={handleKeyPress}
                        className="max-w-sm"
                    />
                    <Button onClick={handleSearch}>搜索</Button>
                </div>
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
                                    <Label htmlFor="url-option" className="text-right">
                                        URL 选项
                                    </Label>
                                    <Select
                                        value={selectedUrlOption}
                                        onValueChange={handleUrlOptionChange}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="选择 URL 选项" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {urlOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="url" className="text-right">
                                        URL
                                    </Label>
                                    <Input
                                        id="url"
                                        value={newUrl}
                                        onChange={(e) => setNewUrl(e.target.value)}
                                        className="col-span-3"
                                        placeholder="https://live.douyin.com/853033329"
                                        required
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
                    <Button onClick={() => fetchUrls(true)}>刷新</Button>
                </div>
            </div>
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">正在录制列表</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>直播间</TableHead>
                            <TableHead>画质</TableHead>
                            <TableHead>时长</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recordings.map((recording, index) => (
                            <TableRow key={index}>
                                <TableCell>{recording.stream}</TableCell>
                                <TableCell>{recording.quality_attribute}</TableCell>
                                <TableCell>{recording.duration}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">直播列表</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">是否注释</TableHead>
                            <TableHead>URL 地址</TableHead>
                            <TableHead>URL 描述</TableHead>
                            <TableHead className="w-[200px]">操作</TableHead>
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
                                <TableCell>
                                    <div className="flex space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => {
                                            setModifyingUrl(item)
                                            setIsModifyDialogOpen(true)
                                        }}>
                                            修改
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteUrl(item.id)}>
                                            删除
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Dialog open={isModifyDialogOpen} onOpenChange={setIsModifyDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>修改 URL</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="modify-url" className="text-right">
                                    URL
                                </Label>
                                <Input
                                    id="modify-url"
                                    value={modifyingUrl?.url || ''}
                                    onChange={(e) => setModifyingUrl(prev => prev ? { ...prev, url: e.target.value } : null)}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="modify-description" className="text-right">
                                    描述
                                </Label>
                                <Input
                                    id="modify-description"
                                    value={modifyingUrl?.description || ''}
                                    onChange={(e) => setModifyingUrl(prev => prev ? { ...prev, description: e.target.value } : null)}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <Button onClick={handleModifyUrl}>确定</Button>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

