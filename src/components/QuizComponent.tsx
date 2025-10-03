"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { ChevronsLeft, ChevronsRight, Lightbulb, Send } from "lucide-react";
import ReactMarkdown from 'react-markdown';

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { cn } from "@/lib/utils";
import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabaseUrl = 'https://xcwnivbdpliylnbmiust.supabase.co';
const public_anon_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhjd25pdmJkcGxpeWxuYm1pdXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzOTIyNzUsImV4cCI6MjA3MDk2ODI3NX0.b4VUd8scPhC_hmcgTbDQKyD7i3bJ0bJOzodbgQe2nFM';
const supabase = createClient(supabaseUrl, public_anon_key);

// 사용자 정보
export interface UserInfo {
  name: string;
  nickname: string;
  affiliation: string;
  created_at: number; // 만료일
}

export function useUser() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('quizUser');
      if (storedUser) {
        let parsedUser: UserInfo = JSON.parse(storedUser);
        let ttl = 12 * 60 * 60 * 1000; // 12시간
        if (parsedUser.created_at && 
            parsedUser.created_at + ttl < Date.now()) {
          setUserInfo(null);
        } else {
          setUserInfo(parsedUser);
        }
      }
    } catch (error) {
      console.error("Failed to parse user info from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUser = (user: UserInfo) => {
    localStorage.setItem('quizUser', JSON.stringify(user));
    setUserInfo(user);
  };

  return { userInfo, saveUser, isLoading };
}

// 사용자 정보 다이얼로그
interface UserInfoCardProps {
  onSave: (userInfo: UserInfo) => void;
}

export function UserInfoCard({ onSave }: UserInfoCardProps) {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [affiliation, setAffiliation] = useState('');

  const handleSave = () => {
    if (name.trim().length < 2) {
        alert('이름은 2글자 이상이어야 합니다.');
    }
    else if (nickname.trim().length < 2) {
      alert('별명은 2글자 이상이어야 합니다.');
    }
    else if (affiliation.trim().length < 2) {
      alert('소속은 2글자 이상이어야 합니다.');
    }
    else {
        let created_at = Date.now();
        onSave({ 
          name: name.trim(), 
          nickname: nickname.trim(), 
          affiliation: affiliation.trim(), 
          created_at 
        });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>사용자 정보 입력</CardTitle>
        <CardDescription>
          퀴즈를 시작하기 전에 이름과 소속을 입력해주세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              placeholder="이름을 입력하세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="nickname">별명</Label>
            <Input
              id="nickname"
              placeholder="별명을 입력하세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="affiliation">소속</Label>
            <Input
              id="affiliation"
              placeholder="소속을 입력하세요"
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} className="w-full">저장하고 시작하기</Button>
      </CardFooter>
    </Card>
  );
}

// Custom Types
export type QuizItemType = 'radio' | 'checkbox' | 'short' | 'long' | 'number';

export interface QuizItem {
  item_type: QuizItemType;
  question: string;
  options?: string[];
  tolerance?: number; // number 형에서 오차 허용 범위
  hint?: string;
  solution: string | string[]; // checkbox의 경우 string 배열
}

// 퀴즈 결과 상태를 위한 타입
export type QuizStatus = 'unanswered' | 'correct' | 'hint-correct' | 'incorrect';

interface QuizProps {
  quizId: string;
  quizItems: QuizItem[];
}

export function QuizComponent({ quizId, quizItems }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<number, string | string[]>>(new Map());
  const [quizStatus, setQuizStatus] = useState<Map<number, QuizStatus>>(
    new Map(quizItems.map((_, i) => [i, 'unanswered']))
  );
  const [hintsUsed, setHintsUsed] = useState<Set<number>>(new Set());
  const [showHint, setShowHint] = useState(false);

  const totalQuestions = quizItems.length;
  const currentItem = quizItems[currentIndex];
  const currentAnswer = userAnswers.get(currentIndex);
  const currentStatus = quizStatus.get(currentIndex) || 'unanswered';
  const isAnswered = currentStatus !== 'unanswered';

  const { userInfo, saveUser, isLoading } = useUser();
  // 상단 통계 계산
  const stats = useMemo(() => {
    let correct = 0;
    let hintCorrect = 0;
    let incorrect = 0;
    quizStatus.forEach((status) => {
      if (status === 'correct') correct++;
      else if (status === 'hint-correct') hintCorrect++;
      else if (status === 'incorrect') incorrect++;
    });
    const remaining = totalQuestions - (correct + hintCorrect + incorrect);
    return { correct, hintCorrect, incorrect, remaining };
  }, [quizStatus, totalQuestions]);

  const progressValue = ((currentIndex + 1) / totalQuestions) * 100;

  // 정답 확인 로직
  const checkAnswer = (answer: string | string[] | undefined): boolean => {
    if (!answer) return false;
    const solution = currentItem.solution;
    if (currentItem.item_type === 'checkbox') {
      if (!Array.isArray(answer) || !Array.isArray(solution)) return false;
      return answer.length === solution.length && [...answer].sort().toString() === [...solution].sort().toString();
    } else if (currentItem.item_type === 'number') {
      return Math.abs(Number(answer) - Number(solution)) <= (currentItem.tolerance || 0);
    } else if (currentItem.item_type === 'short') {
      if (typeof solution === 'string'){
        return answer === solution;
      } else { // solution이 Array인 경우 하나만 일치하면 됨
        return typeof answer == 'string' && solution.includes(answer);
      }
    } else {
      return answer === solution;
    }
  };

  // 이벤트 핸들러
  const handleAnswerChange = (value: string | string[]) => {
    setUserAnswers(new Map(userAnswers.set(currentIndex, value)));
  };

  const handleCheckboxChange = (option: string, checked: boolean) => {
    const currentAns = (userAnswers.get(currentIndex) as string[] | undefined) || [];
    const newAns = checked
      ? [...currentAns, option]
      : currentAns.filter((item) => item !== option);
    handleAnswerChange(newAns);
  };
  
  const handlePrev = () => {
    if (currentIndex > 0) {
      setShowHint(false);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setShowHint(false);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleHint = () => {
    setShowHint(true);
    setHintsUsed(new Set(hintsUsed.add(currentIndex)));
  };

  const handleSubmit = async () => {
    const isCorrect = checkAnswer(currentAnswer);
    const wasHintUsed = hintsUsed.has(currentIndex);
    let newStatus: QuizStatus;

    if (isCorrect) {
      newStatus = wasHintUsed ? 'hint-correct' : 'correct';
    } else {
      newStatus = 'incorrect';
    }

    setQuizStatus(new Map(quizStatus.set(currentIndex, newStatus)));
    const { data, error } = await supabase
    .from('answers')
    .insert([
      { 
        name: userInfo?.name, 
        nickname: userInfo?.nickname, 
        affiliation: userInfo?.affiliation, 
        quiz_id: quizId, 
        item_id: currentIndex, 
        answer: currentAnswer, 
        correct: isCorrect, 
        hint: wasHintUsed },
    ]);
  };

  const isInputEmpty = !currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0);

  // 현재 문제 유형에 맞는 입력 컴포넌트 렌더링
  const renderInputComponent = () => {
    const { item_type, options } = currentItem;
    switch (item_type) {
      case 'radio':
        return (
          <RadioGroup
            value={currentAnswer as string}
            onValueChange={handleAnswerChange}
            disabled={isAnswered}
            className="space-y-2"
          >
            {options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={(currentAnswer as string[] | undefined)?.includes(option)}
                  onCheckedChange={(checked) => handleCheckboxChange(option, !!checked)}
                  disabled={isAnswered}
                />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </div>
        );
      case 'short':
        return (
          <Input
            value={(currentAnswer as string) || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            disabled={isAnswered}
          />
        );
      case 'long':
        return (
          <Textarea
            value={(currentAnswer as string) || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            disabled={isAnswered}
            rows={5}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={(currentAnswer as string) || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            disabled={isAnswered}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <>
    {!!!userInfo && ( 
      <UserInfoCard onSave={saveUser} />
    )}

      {userInfo && ( 
    <TooltipProvider>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <Progress value={progressValue} className="mb-4" />
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>문제 {currentIndex + 1} / {totalQuestions}</span>
            <div className="flex space-x-2 text-xs">
              <span>맞음: {stats.correct}</span>
              <span>힌트: {stats.hintCorrect}</span>
              <span>틀림: {stats.incorrect}</span>
              <span>남음: {stats.remaining}</span>
            </div>
          </div>
          <CardTitle className="pt-4">
            <ReactMarkdown>{currentItem.question}</ReactMarkdown>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[120px]">
            {renderInputComponent()}
          </div>
          {(showHint || isAnswered) && currentItem.hint && (
            <Alert variant="default" className="mt-4">
               <Lightbulb className="h-4 w-4" />
              <AlertTitle>힌트</AlertTitle>
              <AlertDescription>
                <ReactMarkdown>{currentItem.hint}</ReactMarkdown>
              </AlertDescription>
            </Alert>
          )}
          {isAnswered && (
             <Alert
              variant={currentStatus === 'correct' || currentStatus === 'hint-correct' ? 'default' : 'destructive'}
              className="mt-4"
            >
              <AlertTitle>
                {currentStatus === 'correct' || currentStatus === 'hint-correct' ? '맞았습니다!' : '틀렸습니다.'}
              </AlertTitle>
              <AlertDescription>
                정답: {Array.isArray(currentItem.solution) ? currentItem.solution.join(', ') : currentItem.solution}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {/* 이전 버튼 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(currentIndex === 0 && "cursor-not-allowed")}>
                <Button variant="outline" onClick={handlePrev} 
                  disabled={currentIndex === 0}
                >
                  <ChevronsLeft className="h-4 w-4 mr-2" />
                  이전
                </Button>
              </div>
            </TooltipTrigger>
            {currentIndex === 0 && <TooltipContent><p>이전 문제가 없습니다.</p></TooltipContent>}
          </Tooltip>

          <div className="flex space-x-2">
            {/* 힌트 버튼 */}
            <Tooltip>
              <TooltipTrigger asChild>
                  <div className={cn(currentIndex === 0 && "cursor-not-allowed")}>
                    <Button
                        variant="outline"
                        onClick={handleHint}
                        disabled={!currentItem.hint || hintsUsed.has(currentIndex) || isAnswered}
                      >
                        <Lightbulb className="h-4 w-4 mr-2" />
                        힌트
                      </Button>
                    </div>
              </TooltipTrigger>
              {!!!currentItem.hint && <TooltipContent><p>이 문제에는 힌트가 없습니다.</p></TooltipContent>}
              {hintsUsed.has(currentIndex) && !isAnswered && (
                <TooltipContent>
                  <p>이미 힌트를 사용한 문제입니다.</p>
                </TooltipContent>
              )}
            </Tooltip>

            {/* 제출 버튼 */}
            <Tooltip>
              <TooltipTrigger asChild>
                {/* Tooltip이 disabled된 버튼에서도 동작하려면 
                  div와 같은 요소로 한번 감싸줘야 합니다.
                */}
                <div className={cn(isAnswered && "cursor-not-allowed")}>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isAnswered}
                    // disabled 상태에서 포인터 이벤트를 허용해야 툴팁이 뜹니다.
                    className={cn(isAnswered && "pointer-events-none")}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isInputEmpty ? "모름" : "제출"}
                  </Button>
                </div>
              </TooltipTrigger>
              {/* isAnswered가 true일 때만 툴팁 내용을 보여줍니다. */}
              {isAnswered && (
                <TooltipContent>
                  <p>이미 푼 문제입니다. 다음 버튼을 누르세요.</p>
                </TooltipContent>
              )}
            </Tooltip>
          </div>

          {/* 다음 버튼 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div tabIndex={0} className={cn(!isAnswered && "cursor-not-allowed")}>
                <Button
                    onClick={handleNext}
                    // disabled={!isAnswered || currentIndex === totalQuestions - 1}
                    className={cn(isAnswered && currentIndex !== totalQuestions - 1 && "animate-pulse")}
                >
                    다음
                    <ChevronsRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </TooltipTrigger>
            {!isAnswered && <TooltipContent><p>현재 문제를 풀어야 다음으로 이동할 수 있습니다.</p></TooltipContent>}
            {isAnswered && currentIndex === totalQuestions - 1 && <TooltipContent><p>마지막 문제입니다.</p></TooltipContent>}
          </Tooltip>
        </CardFooter>
      </Card>
    </TooltipProvider>
     )}
    </>
  );
}