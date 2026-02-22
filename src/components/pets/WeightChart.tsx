'use client'

import { useMemo } from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts'
import { format, subMonths } from 'date-fns'

interface WeightChartProps {
    currentWeight: number | null
}

export default function WeightChart({ currentWeight }: WeightChartProps) {
    // Generate mock historical data leading up to the current weight.
    // In a real app with a weight_logs table, this data would come from the database.
    const data = useMemo(() => {
        if (!currentWeight) return []

        const points = []
        const now = new Date()

        // Create a slight upward/stable trend ending at currentWeight
        for (let i = 5; i >= 0; i--) {
            const date = subMonths(now, i)
            // Simulate historical weights slightly less than or equal to current
            const simulatedWeight = i === 0 ? currentWeight : currentWeight - (i * 0.2) + (Math.random() * 0.3)

            points.push({
                date: format(date, 'MMM yy'),
                weight: Number(Math.max(0, simulatedWeight).toFixed(2))
            })
        }

        return points
    }, [currentWeight])

    if (!currentWeight || data.length === 0) {
        return (
            <div className="h-[250px] flex items-center justify-center text-[hsl(var(--foreground-muted))] bg-[hsl(var(--surface-overlay))] rounded-xl">
                No weight data available
            </div>
        )
    }

    // Calculate generic healthy range for UI demonstration
    const minTarget = currentWeight * 0.9
    const maxTarget = currentWeight * 1.1

    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--foreground-muted))', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        domain={['dataMin - 1', 'dataMax + 1']}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--foreground-muted))', fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--surface))',
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '8px',
                            color: 'hsl(var(--foreground))'
                        }}
                        itemStyle={{ color: 'hsl(var(--accent))' }}
                    />

                    <ReferenceLine y={maxTarget} stroke="hsl(var(--foreground-muted))" strokeDasharray="3 3" opacity={0.3} />
                    <ReferenceLine y={minTarget} stroke="hsl(var(--foreground-muted))" strokeDasharray="3 3" opacity={0.3} />

                    <Line
                        type="monotone"
                        dataKey="weight"
                        name="Weight (kg)"
                        stroke="hsl(var(--accent))"
                        strokeWidth={3}
                        dot={{ r: 4, fill: 'hsl(var(--surface))', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: 'hsl(var(--accent))', stroke: 'hsl(var(--background))' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
