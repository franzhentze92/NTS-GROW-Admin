"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Analysis } from "@/lib/types"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface AnalysisColumnsProps {
  onViewDetails: (analysis: Analysis) => void;
  onEditAnalysis: (analysis: Analysis) => void;
  onDeleteAnalysis: (analysis: Analysis) => void;
}

export const createColumns = ({ onViewDetails, onEditAnalysis, onDeleteAnalysis }: AnalysisColumnsProps): ColumnDef<Analysis>[] => [
  {
    accessorKey: "client_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Client Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "consultant",
    header: "Consultant",
  },
  {
    accessorKey: "analysis_type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("analysis_type") as string
      let variant: "default" | "secondary" | "destructive" | "outline";
      if (type === "soil") {
        variant = "secondary"; // Brown/earth color for soil
      } else if (type === "leaf") {
        variant = "default"; // Green color for leaf
      } else {
        variant = "outline"; // Default for any other types
      }
      return <Badge variant={variant} className="capitalize">{type}</Badge>
    }
  },
  {
    accessorKey: "crop",
    header: "Crop",
  },
  {
    accessorKey: "sample_no",
    header: "Sample No.",
  },
  {
    accessorKey: "eal_lab_no",
    header: "EAL Lab No.",
    cell: ({ row }) => {
      const ealLabNo = row.getValue("eal_lab_no") as string;
      return ealLabNo || '-';
    }
  },
  {
    accessorKey: "test_count",
    header: "No. of Tests",
    cell: ({ row }) => {
      const testCount = row.getValue("test_count") as number;
      return testCount ? testCount.toString() : '-';
    }
  },
  {
    accessorKey: "status",
    header: "Status",
     cell: ({ row }) => {
      const status = row.getValue("status") as string
      let variant: "default" | "secondary" | "destructive" | "outline";
      switch (status) {
          case 'Emailed':
              variant = 'default'
              break;
          case 'Checked Ready to be Emailed':
              variant = 'secondary'
              break;
          case 'Ready to be Checked':
              variant = 'outline'
              break;
          case 'Draft':
              variant = 'destructive'
              break;
          default:
              variant = 'destructive'
              break;
      }

      return <Badge variant={variant} className="capitalize">{status}</Badge>
    }
  },
   {
    accessorKey: "created_at",
    header: "Date Created",
    cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"))
        return <div>{format(date, "PPP")}</div>
    }
  },
  {
    accessorKey: "updated_by.name",
    header: "Updated By",
     cell: ({ row }) => {
      const updatedBy = row.original.updated_by;
      return typeof updatedBy === 'object' ? updatedBy.name : 'N/A';
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const analysis = row.original
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(analysis.id)}
            >
              Copy Analysis ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onViewDetails(analysis)}>
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditAnalysis(analysis)}>
              Edit analysis
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDeleteAnalysis(analysis)}
              className="text-red-600"
            >
              Delete analysis
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 