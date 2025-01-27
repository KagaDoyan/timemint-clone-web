'use client'

import React, { useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { InfoIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Session } from 'next-auth'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
interface AttendancePolicyPageProps {
    session: any;
}

interface PolicySettings {
    id: number
    max_late_minutes: number
    min_work_hours_per_day: number
    overtime_threshold: number
    updated_at: string
}

export default function AttendancePolicy({ session }: AttendancePolicyPageProps) {
    const [data, setData] = React.useState<PolicySettings>();
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    const fetchData = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/attendance-policies`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }

            const json = await response.json();
            setData(json.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData(prevData => {
            if (!prevData) return undefined;
            return {
                ...prevData,
                [name]: Number(value)  // Convert string to number
            };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data) return;
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/attendance-policies/${data.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.accessToken}`,
            },
            body: JSON.stringify(data),
        })
            .then(res => {
                res.ok ? toast.success('Attendance policy updated') : toast.error('Failed to update attendance policy');
                setIsDialogOpen(false);
            })
            .catch(error => {
                toast.error('Failed to update attendance policy');
            });
        // Handle form submission here
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="container mx-auto px-4 py-6">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Company Attendance Policy</DialogTitle>
                        <DialogDescription>
                            Dialog description, if needed.
                        </DialogDescription>
                    </DialogHeader>
                    <Separator />
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="max_late_minutes">Maximum Late Minutes</Label>
                            <Input
                                type="number"
                                id="max_late_minutes"
                                name="max_late_minutes"
                                value={data?.max_late_minutes}
                                onChange={(e) => handleChange(e)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="min_work_hours_per_day">Minimum Work Hours per Day</Label>
                            <Input
                                type="number"
                                id="min_work_hours_per_day"
                                name="min_work_hours_per_day"
                                value={data?.min_work_hours_per_day}
                                onChange={(e) => handleChange(e)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="overtime_threshold">Overtime Threshold</Label>
                            <Input
                                type="number"
                                id="overtime_threshold"
                                name="overtime_threshold"
                                value={data?.overtime_threshold}
                                onChange={(e) => handleChange(e)}
                            />
                        </div>
                    </div>
                    <Separator />
                    <div className="flex justify-end space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit}>Save</Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Card>
                <CardHeader className="flex flex-row items-center space-x-4">
                    <InfoIcon className="h-6 w-6 text-primary" />
                    <CardTitle>Company Attendance Policy</CardTitle>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        Edit
                    </Button>
                </CardHeader>
                <Separator />
                <CardContent className="space-y-4 pt-6">
                    <p className="text-muted-foreground">
                        last updated {data?.updated_at}
                    </p>

                    <div className="grid gap-4">
                        <div className="flex justify-between items-center">
                            <p className="font-medium">Overtime Threshold</p>
                            <p className="font-medium">{data?.overtime_threshold} hours</p>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <p className="font-medium">Minimum Work Hours per Day</p>
                            <p className="font-medium">{data?.min_work_hours_per_day} hours</p>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <p className="font-medium">Maximum Late Minutes</p>
                            <p className="font-medium">{data?.max_late_minutes} minutes</p>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex items-center space-x-2 text-muted-foreground">
                        <InfoIcon className="h-4 w-4" />
                        <p className="font-medium">
                            These settings indicate an extremely flexible work environment with no strict time constraints.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};