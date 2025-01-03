import Loading from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/utils/api";
import { OrderStatus } from "@prisma/client";
import {
  Box,
  CheckCircle,
  Clock,
  Package,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Fragment, useState } from "react";
import DashboardLayout from "../layout";

export default function OrderDashboard() {
  const [activeTab, setActiveTab] = useState<OrderStatus>("PENDING");

  const session = useSession();
  const userRole = session.data?.user.role;

  const { data: orders, isLoading, refetch } = api.order.getOrders.useQuery();

  const updateOrderStatus = api.order.updateOrderStatus.useMutation({
    onSuccess: () => refetch(),
  });

  const cancelledOrder = api.order.updateOrderStatus.useMutation({
    onSuccess: () => refetch(),
  });

  const filteredOrders = orders?.filter((order) => order.status === activeTab);

  const handleStatusChange = async (
    orderId: number,
    newStatus: OrderStatus,
  ) => {
    await updateOrderStatus.mutateAsync({ orderId, status: newStatus });
  };

  if (isLoading) {
    return <Loading />;
  }

  const statusIcons = {
    PENDING: <Clock className="h-5 w-5" />,
    PROCESSING: <Package className="h-5 w-5" />,
    PACKED: <Box className="h-5 w-5" />,
    SHIPPED: <Truck className="h-5 w-5" />,
    DELIVERED: <ShoppingBag className="h-5 w-5" />,
    COMPLETED: <CheckCircle className="h-5 w-5" />,
    CANCELLED: <XCircle className="h-5 w-5" />,
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto min-h-screen p-4">
        <h1 className="mb-6 text-center text-3xl font-bold text-primary">
          Pesanan
        </h1>
        <Tabs
          defaultValue="PENDING"
          onValueChange={(value) => setActiveTab(value as OrderStatus)}
          className="rounded-lg shadow-lg"
        >
          <TabsList className="grid w-full grid-cols-7 gap-2">
            {Object.entries(statusIcons).map(([status, icon]) => (
              <TabsTrigger
                key={status}
                value={status}
                className="flex items-center justify-center gap-2"
              >
                {icon}
                <span className="hidden sm:inline">{status}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.values(OrderStatus).map((status) => (
            <TabsContent key={status} value={status}>
              {filteredOrders?.length !== 0 ? (
                <Fragment>
                  {filteredOrders?.map((order) => (
                    <Card
                      key={order.id}
                      className="mb-6 overflow-hidden transition-shadow duration-300 hover:shadow-xl"
                    >
                      <CardHeader className="bg-primary/5">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg sm:text-xl">
                            Order #{order.id}
                          </CardTitle>
                          <Badge variant="outline" className="text-sm">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm sm:text-base">
                          Nomor Resi: {order.receipt ?? "Belum tersedia"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6 pt-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                          <div className="flex-1">
                            <h3 className="mb-2 font-semibold">
                              Alamat Tujuan:
                            </h3>
                            <p className="text-sm">{order.name}</p>
                            <p className="text-sm">{order.address}</p>
                            <p className="text-sm">
                              {order.city}, {order.province}, ID,{" "}
                              {order.postalCode}
                            </p>
                          </div>
                          <div className="flex-1">
                            <h3 className="mb-2 font-semibold">
                              Informasi Pengiriman:
                            </h3>
                            <p className="text-sm">
                              Metode: {order.shippingMethod}
                            </p>
                            <p className="text-sm">
                              Pembayaran: {order.Payment?.paymentMethod}
                            </p>
                          </div>
                        </div>
                        <Separator />
                        <ul className="space-y-4">
                          {order.orderProducts.map((op) => (
                            <li key={op.id} className="flex items-center gap-4">
                              <Image
                                src={op.product.images[0]?.imageURL as string}
                                alt={op.product.name}
                                width={80}
                                height={80}
                                className="rounded-md object-cover"
                              />
                              <div className="flex-1">
                                <p className="font-medium">{op.product.name}</p>
                                <p className="text-sm text-gray-500">
                                  Qty: {op.quantity}
                                </p>
                              </div>
                              <p className="font-semibold">
                                Rp
                                {op.product.price.toLocaleString()}
                              </p>
                            </li>
                          ))}
                        </ul>
                        <Separator />
                        <div className="flex items-center justify-between pt-2">
                          <p className="text-lg font-semibold">
                            Total Pesanan:
                          </p>
                          <p className="text-xl font-bold text-primary">
                            Rp
                            {(order.total / 100).toLocaleString()}
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter>
                        {userRole === "ADMIN" && (
                          <Select
                            onValueChange={(value) =>
                              handleStatusChange(order.id, value as OrderStatus)
                            }
                            defaultValue={order.status}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Change status" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(OrderStatus).map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {/* <Button
                      className="ml-2"
                      onClick={() => router.push(`/order/${order.id}`)}
                    >
                      View Details
                    </Button> */}
                        <Button
                          className="ml-2"
                          variant={"destructive"}
                          onClick={() =>
                            cancelledOrder.mutate({
                              orderId: order.id,
                              status: "CANCELLED",
                            })
                          }
                        >
                          Cancel
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </Fragment>
              ) : (
                <Fragment>
                  <Card className="py-20 text-center text-muted-foreground">
                    <CardContent>
                      <CardTitle className="text-3xl">
                        Status {activeTab} Is Empty!
                      </CardTitle>
                    </CardContent>
                  </Card>
                </Fragment>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
