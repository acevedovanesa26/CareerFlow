import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Mic2, 
  FilePlus, 
  User, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  FileSearch
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  user?: any;
  onLogout?: () => void;
}

export function Sidebar({ className, user, onLogout }: SidebarProps) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      color: "text-brand-light",
    },
    {
      label: "Constructor de CV",
      icon: FileText,
      href: "/cv-builder",
      color: "text-brand-light",
    },
    {
      label: "Analizador de CV",
      icon: FileSearch,
      href: "/cv-analyzer",
      color: "text-brand-light",
    },
    {
      label: "Simulador de Entrevistas",
      icon: Mic2,
      href: "/interview",
      color: "text-brand-light",
    },
    {
      label: "Generador de Documentos",
      icon: FilePlus,
      href: "/docs",
      color: "text-brand-light",
    },
  ];

  return (
    <div className={cn(
      "relative flex flex-col h-full border-r bg-brand-dark text-white transition-all duration-300",
      isCollapsed ? "w-20" : "w-64",
      className
    )}>
      <div className="flex items-center justify-between p-6">
        {!isCollapsed && (
          <Link to="/" className="flex items-center gap-2">
            <div className="p-1 bg-brand-light rounded-lg">
              <Briefcase className="w-6 h-6 text-brand-dark" />
            </div>
            <span className="font-bold text-xl tracking-tight">CareerFlow AI</span>
          </Link>
        )}
        {isCollapsed && (
          <div className="p-1 bg-brand-light rounded-lg mx-auto">
            <Briefcase className="w-6 h-6 text-brand-dark" />
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 py-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              to={route.href}
              className={cn(
                "group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-white/10 rounded-lg transition",
                location.pathname === route.href ? "bg-white/10 text-brand-light" : "text-zinc-400",
                isCollapsed && "justify-center"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5", !isCollapsed && "mr-3", route.color)} />
                {!isCollapsed && route.label}
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 mt-auto">
        <Separator className="mb-4 bg-white/10" />
        <div className={cn(
          "flex items-center gap-3",
          isCollapsed ? "justify-center" : "px-2"
        )}>
          <Avatar className="h-9 w-9 border border-white/20">
            <AvatarImage src={user?.photoURL} />
            <AvatarFallback className="bg-brand-medium text-white">
              {user?.displayName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.displayName || "Usuario"}</p>
              <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
            </div>
          )}
        </div>
        <Button 
          variant="ghost" 
          className={cn(
            "w-full mt-4 text-zinc-400 hover:text-white hover:bg-white/10",
            isCollapsed ? "justify-center px-0" : "justify-start"
          )}
          onClick={onLogout}
        >
          <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
          {!isCollapsed && "Cerrar Sesión"}
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-20 h-8 w-8 rounded-full border bg-white text-brand-dark hover:bg-zinc-100 hidden md:flex"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
    </div>
  );
}
