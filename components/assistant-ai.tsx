"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MicIcon, SendIcon, PlusCircleIcon, TrashIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCompletion } from "@ai-sdk/react";
import { useChatStore, Message } from "@/hooks/store/chat";
import { MemoizedMarkdown } from "./memoized-markdown";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

type TemplateMessage = {
  id: string;
  text: string;
  tool?: string;
};

export default function AssistantAI() {
  const { completion, complete, isLoading } = useCompletion({
    api: "/api/ai",

    onFinish(_, completion) {
      // console.log(completion, "completion finish");

      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: completion,
        role: "assistant",
        timestamp: new Date(),
      };
      addMessage(assistantMessage);

      // Setel teks yang akan dibacakan, proses dahulu untuk TTS
      // setTextToSpeak(completion);
    },
  });

  // Integrasi Speech Recognition
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    finalTranscript,
  } = useSpeechRecognition();

  // Efek untuk mengisi input dengan hasil transkripsi
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const { messages, addMessage, clearMessages } = useChatStore();
  const [streamingId, setStreamingId] = useState<string | null>(null);

  // State untuk melacak teks yang harus dibacakan
  // const [textToSpeak, setTextToSpeak] = useState<string | undefined>(undefined);
  const templateMessages: TemplateMessage[] = [
    { id: "t1", text: "Bagaimana kondisi suhu di dalam rumah?" },
    { id: "t2", text: "Tolong nyalakan port 2" },
    { id: "t3", text: "Tolong nyalakan kipas di port 1" },
    { id: "t4", text: "Tolong nyalakan semua port" },
    { id: "t7", text: "Tolong nyalakan lampu di dalam rumah" },
    // {
    //   id: "t5",
    //   text: "Kelompok mana yang paling sering jadi juara?",
    //   tool: "roasting",
    // },
    // {
    //   id: "t6",
    //   text: "Kelompok mana yang palin beban?",
    //   tool: "roasting",
    // },
    //
  ];

  const [showOnboarding, setShowOnboarding] = useState(messages.length === 0);
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const isMobile = useIsMobile();

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (messageText: string = input) => {
    if (messageText.trim() === "" || isLoading) return;

    setShowOnboarding(false);

    // Hentikan speech recognition jika sedang berjalan
    if (listening) {
      SpeechRecognition.stopListening();
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      role: "user",
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInput("");

    // Tambahkan pesan sementara untuk streaming
    const tempId = Date.now().toString();
    setStreamingId(tempId);

    // Get AI response using the complete function
    await complete(messageText, {
      body: {
        tool: "roasting",
      },
    });

    setStreamingId(null);
  };

  const handleTemplateClick = (text: string) => {
    handleSendMessage(text);
  };

  const handleVoiceInput = () => {
    if (!browserSupportsSpeechRecognition) {
      alert("Browser Anda tidak mendukung pengenalan suara.");
      return;
    }

    if (!listening) {
      // Mulai mendengarkan
      resetTranscript();
      SpeechRecognition.startListening({
        language: "id-ID",
        continuous: false,
      });
    } else {
      // Berhenti mendengarkan
      SpeechRecognition.stopListening();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (finalTranscript) {
      handleSendMessage(finalTranscript);
    }
  }, [finalTranscript]);

  return (
    <div className={`flex flex-col ${isMobile ? "h-[350px]" : "h-[400px]"}`}>
      {/* Audio Player untuk TTS */}
      {/* <AudioPlayer text={textToSpeak} /> */}
      <div className="flex justify-between items-center mb-2">
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearMessages();
              setShowOnboarding(true);
            }}
            className="flex items-center h-7"
            title="Hapus riwayat chat"
          >
            <TrashIcon className={isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"} />
            <span className={isMobile ? "text-xs" : ""}>Hapus Riwayat</span>
          </Button>
        )}
      </div>
      <ScrollArea
        className={`flex-1 ${isMobile ? "mb-2 p-2" : "mb-4 p-4"} space-y-4`}
        ref={scrollAreaRef}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            } mb-4`}
          >
            <div
              className={`rounded-lg px-4 py-2 ${
                isMobile ? "max-w-[90%]" : "max-w-[80%]"
              } ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <MemoizedMarkdown id={message.id} content={message.content} />
              <p className="text-xs opacity-70 mt-1">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && streamingId && (
          <div className="flex justify-start mb-4">
            <div
              className={`rounded-lg px-4 py-2 ${
                isMobile ? "max-w-[90%]" : "max-w-[80%]"
              } bg-muted`}
            >
              <MemoizedMarkdown id="streaming" content={completion || "..."} />
              <p className="text-xs opacity-70 mt-1">
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        )}

        {isLoading && !streamingId && (
          <div className="flex justify-start mb-4">
            <div
              className={`rounded-lg px-4 py-2 ${
                isMobile ? "max-w-[90%]" : "max-w-[80%]"
              } bg-muted`}
            >
              <div className="flex space-x-2 items-center">
                <div
                  className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                  style={{ animationDelay: "100ms" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                  style={{ animationDelay: "200ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {showOnboarding && messages.length === 0 && (
          <div
            className={`mx-auto flex w-full flex-col space-y-3 ${
              isMobile ? "px-1" : "px-4 max-w-xl"
            }`}
          >
            <h2
              className={`${
                isMobile ? "text-lg" : "text-3xl"
              } text-muted-foreground mb-2 font-semibold`}
            >
              How can I help you?
            </h2>
            <div className="flex flex-col w-full overflow-visible">
              {templateMessages.map((template, index) => (
                <Button
                  key={template.id}
                  variant="outline"
                  className={`justify-start dark:bg-transparent dark:hover:bg-primary dark:hover:text-primary-foreground text-left h-auto ${
                    isMobile ? "px-2 py-2 mb-1" : "px-4 py-3"
                  } border-0 ${
                    index === templateMessages.length - 1 ? "" : "border-b"
                  } ${isMobile ? "text-xs" : ""}`}
                  onClick={() => handleTemplateClick(template.text)}
                >
                  <PlusCircleIcon
                    className={`${
                      isMobile ? "h-3 w-3" : "h-4 w-4"
                    } mr-2 flex-shrink-0`}
                  />
                  <span className="truncate">{template.text}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>

      <div
        className={`flex items-center ${
          isMobile ? "space-x-1 pt-1" : "space-x-2 pt-2"
        }`}
      >
        <Button
          size={isMobile ? "sm" : "icon"}
          variant={listening ? "destructive" : "outline"}
          onClick={handleVoiceInput}
          className="flex-shrink-0"
          title={listening ? "Berhenti rekam" : "Rekam suara"}
        >
          <MicIcon className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
        </Button>
        <Input
          placeholder={
            isMobile ? "Ketik pesan..." : "Ketik pesan Anda di sini..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
          disabled={isLoading}
        />
        <Button
          onClick={() => handleSendMessage()}
          className="flex-shrink-0"
          size={isMobile ? "sm" : "default"}
          disabled={isLoading}
        >
          <SendIcon className={isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"} />
          {isMobile ? "" : "Kirim"}
        </Button>
      </div>
    </div>
  );
}
