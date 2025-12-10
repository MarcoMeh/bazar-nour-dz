import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Eye, Loader2, Filter } from 'lucide-react';

interface StoreRequest {
    id: string;
    owner_name: string;
    store_name: string;
    phone: string;
    email: string;
    wilaya: string;
    description: string | null;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
}

const StoreRegistrations = () => {
    const [requests, setRequests] = useState<StoreRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<StoreRequest | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('store_registration_requests' as any)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests(data || []);
        } catch (error: any) {
            console.error('Error fetching requests:', error);
            toast.error('خطأ في تحميل الطلبات');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (request: StoreRequest) => {
        setSelectedRequest(request);
        setAdminNotes(request.admin_notes || '');
        setDetailsOpen(true);
    };

    const handleUpdateStatus = async (requestId: string, status: 'approved' | 'rejected') => {
        setActionLoading(true);
        try {
            const { error } = await supabase
                .from('store_registration_requests' as any)
                .update({
                    status,
                    admin_notes: adminNotes || null,
                })
                .eq('id', requestId);

            if (error) throw error;

            toast.success(status === 'approved' ? 'تمت الموافقة على الطلب' : 'تم رفض الطلب');
            setDetailsOpen(false);
            fetchRequests();
        } catch (error: any) {
            console.error('Error updating status:', error);
            toast.error('خطأ في تحديث الحالة');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">قيد الانتظار</Badge>;
            case 'approved':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">موافق عليه</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">مرفوض</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ar-DZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const filteredRequests = requests.filter((req) => {
        if (filterStatus === 'all') return true;
        return req.status === filterStatus;
    });

    const stats = {
        total: requests.length,
        pending: requests.filter((r) => r.status === 'pending').length,
        approved: requests.filter((r) => r.status === 'approved').length,
        rejected: requests.filter((r) => r.status === 'rejected').length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">طلبات تسجيل المحلات</h1>
                <p className="text-muted-foreground">
                    إدارة ومراجعة طلبات انضمام المحلات الجديدة
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 border-2">
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-sm text-muted-foreground">إجمالي الطلبات</div>
                </Card>
                <Card className="p-4 border-2 border-yellow-200 bg-yellow-50">
                    <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
                    <div className="text-sm text-yellow-600">قيد الانتظار</div>
                </Card>
                <Card className="p-4 border-2 border-green-200 bg-green-50">
                    <div className="text-2xl font-bold text-green-700">{stats.approved}</div>
                    <div className="text-sm text-green-600">تمت الموافقة</div>
                </Card>
                <Card className="p-4 border-2 border-red-200 bg-red-50">
                    <div className="text-2xl font-bold text-red-700">{stats.rejected}</div>
                    <div className="text-sm text-red-600">مرفوض</div>
                </Card>
            </div>

            {/* Filter */}
            <Card className="p-4">
                <div className="flex items-center gap-4">
                    <Filter className="h-5 w-5 text-muted-foreground" />
                    <Label>تصفية حسب الحالة:</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">الكل ({stats.total})</SelectItem>
                            <SelectItem value="pending">قيد الانتظار ({stats.pending})</SelectItem>
                            <SelectItem value="approved">موافق عليه ({stats.approved})</SelectItem>
                            <SelectItem value="rejected">مرفوض ({stats.rejected})</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {/* Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right">اسم صاحب المحل</TableHead>
                            <TableHead className="text-right">اسم المحل</TableHead>
                            <TableHead className="text-right">رقم الهاتف</TableHead>
                            <TableHead className="text-right">الولاية</TableHead>
                            <TableHead className="text-right">تاريخ الطلب</TableHead>
                            <TableHead className="text-right">الحالة</TableHead>
                            <TableHead className="text-right">الإجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                                    <p className="text-muted-foreground mt-2">جاري التحميل...</p>
                                </TableCell>
                            </TableRow>
                        ) : filteredRequests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <p className="text-muted-foreground">لا توجد طلبات</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRequests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell className="font-medium">{request.owner_name}</TableCell>
                                    <TableCell>{request.store_name}</TableCell>
                                    <TableCell dir="ltr" className="text-right">{request.phone}</TableCell>
                                    <TableCell>{request.wilaya}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {formatDate(request.created_at)}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewDetails(request)}
                                            className="gap-2"
                                        >
                                            <Eye className="h-4 w-4" />
                                            عرض
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Details Dialog */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">تفاصيل الطلب</DialogTitle>
                        <DialogDescription>
                            مراجعة والموافقة أو رفض طلب تسجيل المحل
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-6">
                            {/* Request Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm text-muted-foreground">اسم صاحب المحل</Label>
                                    <p className="text-lg font-semibold mt-1">{selectedRequest.owner_name}</p>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground">اسم المحل</Label>
                                    <p className="text-lg font-semibold mt-1">{selectedRequest.store_name}</p>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground">رقم الهاتف</Label>
                                    <p className="text-lg font-semibold mt-1" dir="ltr">{selectedRequest.phone}</p>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground">البريد الإلكتروني</Label>
                                    <p className="text-lg font-semibold mt-1" dir="ltr">{selectedRequest.email}</p>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground">الولاية</Label>
                                    <p className="text-lg font-semibold mt-1">{selectedRequest.wilaya}</p>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground">الحالة</Label>
                                    <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                                </div>
                            </div>

                            {/* Description */}
                            {selectedRequest.description && (
                                <div>
                                    <Label className="text-sm text-muted-foreground">وصف المحل</Label>
                                    <Card className="p-4 mt-2 bg-muted/50">
                                        <p className="text-sm whitespace-pre-line">{selectedRequest.description}</p>
                                    </Card>
                                </div>
                            )}

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <Label className="text-muted-foreground">تاريخ الطلب</Label>
                                    <p className="mt-1">{formatDate(selectedRequest.created_at)}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">آخر تحديث</Label>
                                    <p className="mt-1">{formatDate(selectedRequest.updated_at)}</p>
                                </div>
                            </div>

                            {/* Admin Notes */}
                            <div>
                                <Label htmlFor="admin_notes">ملاحظات الأدمن</Label>
                                <Textarea
                                    id="admin_notes"
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="أضف ملاحظات حول هذا الطلب..."
                                    className="mt-2 min-h-[100px]"
                                />
                            </div>

                            {/* Actions */}
                            {selectedRequest.status === 'pending' && (
                                <div className="flex gap-3 pt-4 border-t">
                                    <Button
                                        onClick={() => handleUpdateStatus(selectedRequest.id, 'approved')}
                                        disabled={actionLoading}
                                        className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                                    >
                                        {actionLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <CheckCircle className="h-4 w-4" />
                                        )}
                                        الموافقة على الطلب
                                    </Button>
                                    <Button
                                        onClick={() => handleUpdateStatus(selectedRequest.id, 'rejected')}
                                        disabled={actionLoading}
                                        variant="destructive"
                                        className="flex-1 gap-2"
                                    >
                                        {actionLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <XCircle className="h-4 w-4" />
                                        )}
                                        رفض الطلب
                                    </Button>
                                </div>
                            )}

                            {selectedRequest.status !== 'pending' && (
                                <Card className="p-4 bg-muted">
                                    <p className="text-sm text-center">
                                        {selectedRequest.status === 'approved'
                                            ? '✅ تمت الموافقة على هذا الطلب'
                                            : '❌ تم رفض هذا الطلب'
                                        }
                                    </p>
                                    {selectedRequest.admin_notes && (
                                        <div className="mt-3 pt-3 border-t">
                                            <Label className="text-xs text-muted-foreground">ملاحظات سابقة:</Label>
                                            <p className="text-sm mt-1">{selectedRequest.admin_notes}</p>
                                        </div>
                                    )}
                                </Card>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StoreRegistrations;
