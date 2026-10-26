import Link from "next/link";

const roadmap = [
  {
    stage: "阶段一",
    title: "项目基础框架",
    status: "已完成",
    detail: "Next.js 脚手架、全局布局与导航、路由结构、构建流水线",
  },
  {
    stage: "阶段二",
    title: "记账核心功能",
    status: "进行中",
    detail: "Prisma 数据建模、收支流水的增删改查 API 与明细页面",
  },
  {
    stage: "阶段三",
    title: "用户系统",
    status: "待开始",
    detail: "注册 / 登录（Auth.js）、按用户隔离数据",
  },
  {
    stage: "阶段四",
    title: "数据统计看板",
    status: "待开始",
    detail: "月度收支趋势、分类占比图表，整体打磨与部署说明",
  },
];

const features = [
  { icon: "📝", title: "快速记账", desc: "收入 / 支出分类记录，备注与日期一目了然" },
  { icon: "📂", title: "明细管理", desc: "按月筛选流水，随手增删改查" },
  { icon: "🔐", title: "多用户", desc: "注册登录后数据各自独立、互不可见" },
  { icon: "📊", title: "统计看板", desc: "月度趋势与分类占比，花钱去向清清楚楚" },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-12">
      <section className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 px-8 py-14 text-white">
        <h1 className="text-4xl font-bold tracking-tight">随手记</h1>
        <p className="mt-3 max-w-xl text-lg text-emerald-50">
          一个全栈个人记账应用：记下每一笔收支，看清每一个月的去向。
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/transactions"
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
          >
            开始记账
          </Link>
          <Link
            href="/stats"
            className="rounded-lg border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            查看统计
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold">功能亮点</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="text-2xl">{f.icon}</div>
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold">开发路线图</h2>
        <p className="mt-1 text-sm text-slate-500">
          项目按阶段推进，每个阶段完成后在项目根目录留存对应可运行的快照文件夹。
        </p>
        <ol className="mt-4 space-y-3">
          {roadmap.map((item) => (
            <li
              key={item.stage}
              className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <span className="mt-0.5 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                {item.stage}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{item.title}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.status === "已完成"
                        ? "bg-emerald-50 text-emerald-700"
                        : item.status === "进行中"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
