import { useMemo } from 'react';
import type { WeeklyReport, Category } from '@/types';
import { Card } from '@/components/ui/card';
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts';
import { IMPORTANCE_COLORS } from '@/lib/constants';

interface DashboardChartsProps {
  reports: WeeklyReport[];
  categories: Category[];
}

export function DashboardCharts({ reports, categories }: DashboardChartsProps) {
  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  // Donut chart data: category distribution
  const donutData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const report of reports) {
      for (const item of report.items) {
        counts.set(item.categoryId, (counts.get(item.categoryId) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([catId, count]) => {
        const cat = categoryMap.get(catId);
        return {
          name: cat?.name ?? '기타',
          value: count,
          color: cat?.color ?? '#9CA3AF',
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [reports, categoryMap]);

  const totalItems = donutData.reduce((sum, d) => sum + d.value, 0);

  // Line chart data: weekly trend per category
  const lineData = useMemo(() => {
    const weekMap = new Map<string, Record<string, number>>();
    for (const report of reports.sort((a, b) => a.week - b.week)) {
      const label = `W${report.week}`;
      if (!weekMap.has(label)) weekMap.set(label, {});
      const weekData = weekMap.get(label)!;
      for (const item of report.items) {
        const cat = categoryMap.get(item.categoryId);
        const catName = cat?.name ?? '기타';
        weekData[catName] = (weekData[catName] ?? 0) + 1;
      }
    }
    return Array.from(weekMap.entries()).map(([week, data]) => ({
      week,
      ...data,
    }));
  }, [reports, categoryMap]);

  const lineCategories = useMemo(() => {
    const names = new Set<string>();
    for (const d of lineData) {
      for (const key of Object.keys(d)) {
        if (key !== 'week') names.add(key);
      }
    }
    return Array.from(names).map((name) => {
      const cat = categories.find((c) => c.name === name);
      return { name, color: cat?.color ?? '#9CA3AF' };
    });
  }, [lineData, categories]);

  // Stacked bar chart: importance distribution per week
  const barData = useMemo(() => {
    const weekMap = new Map<string, { high: number; medium: number; low: number }>();
    for (const report of reports.sort((a, b) => a.week - b.week)) {
      const label = `W${report.week}`;
      if (!weekMap.has(label)) weekMap.set(label, { high: 0, medium: 0, low: 0 });
      const data = weekMap.get(label)!;
      for (const item of report.items) {
        data[item.importance]++;
      }
    }
    return Array.from(weekMap.entries()).map(([week, data]) => ({
      week,
      ...data,
    }));
  }, [reports]);

  const textColor = 'var(--color-text-muted)';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Donut Chart */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-text-primary mb-4">카테고리별 업무 분포</h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={donutData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              dataKey="value"
              paddingAngle={2}
            >
              {donutData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '13px',
              }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              iconSize={8}
              formatter={(value: string) => (
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>{value}</span>
              )}
            />
            {/* Center label */}
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="central"
              fill="var(--color-text-primary)"
              fontSize={20}
              fontWeight={700}
            >
              {totalItems}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Line Chart */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-text-primary mb-4">주차별 업무량 추이</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="week" tick={{ fill: textColor, fontSize: 12 }} />
            <YAxis tick={{ fill: textColor, fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '13px',
              }}
            />
            {lineCategories.map((cat) => (
              <Line
                key={cat.name}
                type="monotone"
                dataKey={cat.name}
                stroke={cat.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Stacked Bar Chart */}
      <Card className="p-6 lg:col-span-2">
        <h3 className="text-base font-semibold text-text-primary mb-4">중요도별 분포</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="week" tick={{ fill: textColor, fontSize: 12 }} />
            <YAxis tick={{ fill: textColor, fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '13px',
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value: string) => {
                const labels: Record<string, string> = { high: '높음', medium: '보통', low: '낮음' };
                return (
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                    {labels[value] ?? value}
                  </span>
                );
              }}
            />
            <Bar dataKey="high" stackId="a" fill={IMPORTANCE_COLORS.high} radius={[0, 0, 0, 0]} />
            <Bar dataKey="medium" stackId="a" fill={IMPORTANCE_COLORS.medium} />
            <Bar dataKey="low" stackId="a" fill={IMPORTANCE_COLORS.low} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
