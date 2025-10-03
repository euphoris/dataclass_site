
"use client";

import { useState, useEffect, useCallback, useRef } from "react"; // useEffect, useCallback, useRef 추가
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// components/CustomYAxisTick.tsx

import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Recharts에서 tick에 전달하는 props 타입
interface CustomYAxisTickProps {
  x?: number;
  y?: number;
  payload?: {
    value: string; // "nickname (affiliation)"
    payload: {
      name: string; // 원본 이름
    };
  };
  chartData?: ChartData[]; // ✅ 전체 차트 데이터를 prop으로 받습니다
}

export function CustomYAxisTick({ x, y, payload, chartData }: CustomYAxisTickProps) {
  if (!x || !y || !payload) return null;

  // payload.value는 YAxis의 dataKey로 지정된 값입니다.
  const userIdentifier = payload.value; 
  // payload.payload는 해당 막대의 전체 데이터 객체입니다.
  // ✅ chartData에서 현재 tick 값과 일치하는 항목을 찾습니다.
  const dataEntry = chartData.find(
    (item) => item.userIdentifier === userIdentifier
  );

  // 해당 항목에서 원본 이름을 가져옵니다.
  const nickname = dataEntry ? dataEntry.name : "이름 정보 없음";

  return (
    <g transform={`translate(${x},${y})`}>
      <TooltipProvider>
        <ShadcnTooltip>
          <TooltipTrigger asChild>
            <text x={0} y={0} dy={4} textAnchor="end" fill="#666">
              {/* 화면에는 닉네임만 표시, 너무 길면 잘라내기 */}
              {nickname.length > 20
                ? `${nickname.substring(0, 20)}...`
                : nickname}
            </text>
          </TooltipTrigger>
          <TooltipContent>
            <p>{userIdentifier}</p>
          </TooltipContent>
        </ShadcnTooltip>
      </TooltipProvider>
    </g>
  );
}


// Supabase에서 가져온 데이터의 타입 정의
interface Answer {
  item_id: number| null
  name: string | null;
  affiliation: string | null;
  nickname: string | null; // nickname 추가
  correct: boolean | null;
  hint: boolean | null;
  created_at: string | null;
}

// 차트에 사용될 가공된 데이터의 타입 정의
interface ChartData {
  userIdentifier: string; // "nickname (소속)"
  name: string;           // 원본 이름 (툴팁용)
  correct: number;        // 힌트 없이 맞음
  hintCorrect: number;    // 힌트 보고 맞음
  incorrect: number;      // 틀림
}

interface ItemChartData {
  itemId: number;
  correct: number;
  hintCorrect: number;
  incorrect: number;
}

export function QuizResultVisualizer() {
  const [supabaseUrl, setSupabaseUrl] = useState("https://xcwnivbdpliylnbmiust.supabase.co");
  const [supabaseKey, setSupabaseKey] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhjd25pdmJkcGxpeWxuYm1pdXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM5MjI3NSwiZXhwIjoyMDcwOTY4Mjc1fQ.hnh9pURhacXgfWinuBTGvYMsglppt1IcKe8MzbWzHvI");
  const [quizId, setQuizId] = useState("hypothesis-testing");
  const [hours, setHours] = useState(2);
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [itemChartData, setItemChartData] = useState<ItemChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (client: SupabaseClient | null, id: string, hours: number) => {
    if (!client || !id) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
      const { data, error: fetchError } = await client
        .from("answers")
        .select("item_id, name, nickname, affiliation, correct, hint, created_at") // nickname 조회
        .eq("quiz_id", id)
        .gte("created_at", hoursAgo);

      if (fetchError) throw fetchError;
      if (!data) throw new Error("데이터를 불러오지 못했습니다.");

      // 중복 제거를 위한 데이터 필터링
      const uniqueSubmissions = new Map<string, Answer>();

      // 먼저 created_at 기준으로 오름차순 정렬 (오래된 것이 먼저 오도록)
      data.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      data.forEach((row: Answer) => {
        // item_id, name, affiliation을 조합하여 고유 키 생성
        const submissionKey = `${row.item_id}-${row.name}-${row.affiliation}`;

        // 이 키로 제출된 기록이 없다면 Map에 추가 (가장 빠른 기록만 저장됨)
        if (!uniqueSubmissions.has(submissionKey)) {
          uniqueSubmissions.set(submissionKey, row);
        }
      });

      // Map의 값들을 배열로 변환하여 유일한 제출 기록만 남김
      const filteredData = Array.from(uniqueSubmissions.values());

      const userResults = new Map<string, ChartData>();
      const itemResults = new Map<number, { correct: number; hintCorrect: number; incorrect: number }>();

      filteredData.forEach((row: Answer) => {
        const identifier = `${row.name} (${row.affiliation})`;
        
        if (!userResults.has(identifier)) {
          userResults.set(identifier, {
            userIdentifier: identifier,
            name: row.nickname,
            correct: 0,
            hintCorrect: 0,
            incorrect: 0,
          });
        }

        if(!itemResults.has(row.item_id!)){
          itemResults.set(row.item_id!, {correct:0, hintCorrect:0, incorrect:0});
        }
        
        const userStat = userResults.get(identifier)!;
        const itemStat = itemResults.get(row.item_id!)!;
        if (row.correct === true) {
          if (row.hint === true){
             userStat.hintCorrect += 1;
             itemStat.hintCorrect += 1;
          }
          else{
             userStat.correct += 1;
            itemStat.correct += 1;
          }
        } else {
          userStat.incorrect += 1;
          itemStat.incorrect += 1;
        }
      });
      
      const processedData = Array.from(userResults.values());
      processedData.sort((a, b) => {
        // 1순위: 힌트 없이 맞은 개수 내림차순
        if (b.correct !== a.correct) {
          return b.correct - a.correct;
        }
        // 2순위: 힌트 보고 맞은 개수 내림차순
        return b.hintCorrect - a.hintCorrect;
      });
      setChartData(processedData);

      // 문제 번호 순으로 정렬
      const processedItemData = Array.from(itemResults.entries())
      processedItemData.sort((a, b) => a[0] - b[0]);
      setItemChartData(processedItemData.map(([itemId, stats]) => ({
        itemId,
        ...stats
      })));

    } catch (err: any) {
      setError(`데이터 처리 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []); // 종속성 배열이 비어있으므로 함수는 한 번만 생성됩니다.

  // "결과 보기" 버튼 클릭 핸들러
  const handleInitialFetch = () => {
    if (!supabaseUrl || !supabaseKey || !quizId) {
      setError("Supabase URL, API Key, Quiz ID를 모두 입력해주세요.");
      return;
    }
    const client = createClient(supabaseUrl, supabaseKey);
    setSupabaseClient(client);
    fetchData(client, quizId, hours);
  };
  
  // 자동 새로고침 설정
  useEffect(() => {
    // Supabase client와 quizId가 설정되면 1분마다 데이터 fetch
    if (supabaseClient && quizId) {
      // 이전 interval이 있다면 정리
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // 1분(60000ms)마다 fetchData 실행
      intervalRef.current = setInterval(() => {
        console.log("Auto-refreshing data...");
        fetchData(supabaseClient, quizId, hours);
      }, 60000);

      // 컴포넌트가 언마운트되거나, client/quizId가 변경될 때 interval 정리
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [supabaseClient, quizId, fetchData]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>퀴즈 결과 시각화</CardTitle>
          <CardDescription>
            Supabase 프로젝트 정보를 입력하여 최근 퀴즈 결과를 확인하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="supabase-url">Supabase URL</Label>
            <Input
              id="supabase-url"
              placeholder="https://<project-ref>.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supabase-key">Supabase Anon Key</Label>
            <Input
              id="supabase-key"
              type="password"
              placeholder="Supabase Public Anon Key"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quiz-id">Quiz ID</Label>
            <Input
              id="quiz-id"
              placeholder="결과를 조회할 퀴즈의 ID"
              value={quizId}
              onChange={(e) => setQuizId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hours">최근 몇 시간</Label>
            <Input
              id="hours"
              type="number"
              placeholder="최근 몇 시간 내 결과를 조회"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
            />
          </div>
          <Button onClick={handleInitialFetch} disabled={isLoading} className="w-full">
            {isLoading ? "결과 불러오는 중..." : "결과 보기"}
          </Button>
        </CardContent>
      </Card>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>참여자별 정답 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={40 * chartData.length + 60}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis 
                  dataKey="userIdentifier" 
                  type="category" 
                  width={150} 
                  tick={<CustomYAxisTick  chartData={chartData} />} 
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="correct" stackId="a" name="정답 (힌트X)" fill="#4ade80" />
                <Bar dataKey="hintCorrect" stackId="a" name="정답 (힌트O)" fill="#facc15" />
                <Bar dataKey="incorrect" stackId="a" name="오답" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {itemChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>문제별 정답 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={40 * itemChartData.length + 60}>
              <BarChart
                data={itemChartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis 
                  dataKey="itemId" 
                  type="category" 
                  width={150} 
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="correct" stackId="a" name="정답 (힌트X)" fill="#4ade80" />
                <Bar dataKey="hintCorrect" stackId="a" name="정답 (힌트O)" fill="#facc15" />
                <Bar dataKey="incorrect" stackId="a" name="오답" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>        
      )}
    </div>
  );
}