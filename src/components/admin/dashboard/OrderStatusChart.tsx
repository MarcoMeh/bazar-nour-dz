import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderStatusChartProps {
    data: any[];
}

export function OrderStatusChart({ data }: OrderStatusChartProps) {
    // Translate status names for display
    const renderLabel = ({ name, percent }: any) => {
        return `${(percent * 100).toFixed(0)}%`;
    };

    return (
        <Card className="col-span-4 lg:col-span-1">
            <CardHeader>
                <CardTitle>حالة الطلبات</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    {data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            لا توجد بيانات
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
