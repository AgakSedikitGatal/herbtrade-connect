import { useState } from "react";
import { Web3Header } from "@/components/Web3Header";
import { Web3Footer } from "@/components/Web3Footer";
import { Web3Background } from "@/components/Web3Background";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, FileText, Clock, CheckCircle, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { categories } from "@/lib/products";
import { useBuyerRequests } from "@/contexts/BuyerRequestContext";
import { toast } from "sonner";
import { motion } from "framer-motion";

const ProductRequest = () => {
  const { requests, addRequest, removeRequest } = useBuyerRequests();
  const [form, setForm] = useState({
    productName: "",
    quantity: "",
    unit: "Kilogram",
    budgetMin: "",
    budgetMax: "",
    description: "",
    category: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productName || !form.quantity || !form.budgetMin || !form.budgetMax) {
      toast.error("Mohon isi semua field yang wajib");
      return;
    }
    addRequest({
      productName: form.productName,
      quantity: parseInt(form.quantity),
      unit: form.unit,
      budgetMin: parseFloat(form.budgetMin),
      budgetMax: parseFloat(form.budgetMax),
      description: form.description,
      category: form.category,
    });
    toast.success("Permintaan berhasil diajukan!");
    setForm({ productName: "", quantity: "", unit: "Kilogram", budgetMin: "", budgetMax: "", description: "", category: "" });
  };

  const statusConfig = {
    open: { label: "Open", color: "bg-primary/20 text-primary", icon: Clock },
    matched: { label: "Matched", color: "bg-green-500/20 text-green-400", icon: CheckCircle },
    closed: { label: "Closed", color: "bg-muted text-muted-foreground", icon: FileText },
  };

  return (
    <div className="min-h-screen gradient-bg relative">
      <Web3Background />
      <Web3Header />
      <PageTransition>
        <div className="container mx-auto px-4 py-24 relative z-10">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link to="/buyer/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-xl glow-primary">
                <FileText className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Product Request</h1>
                <p className="text-sm text-muted-foreground">Ajukan permintaan produk herbal ke supplier</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <Card className="lg:col-span-1 glass-card border-border/50">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-primary" />
                  Buat Permintaan Baru
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="productName">Nama Produk *</Label>
                    <Input id="productName" value={form.productName} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} placeholder="e.g. Turmeric, Ginger" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="quantity">Jumlah *</Label>
                      <Input id="quantity" type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="100" />
                    </div>
                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Select value={form.unit} onValueChange={v => setForm(f => ({ ...f, unit: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Kilogram">Kilogram</SelectItem>
                          <SelectItem value="Ton">Ton</SelectItem>
                          <SelectItem value="Box">Box</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="budgetMin">Budget Min ($) *</Label>
                      <Input id="budgetMin" type="number" value={form.budgetMin} onChange={e => setForm(f => ({ ...f, budgetMin: e.target.value }))} placeholder="5" />
                    </div>
                    <div>
                      <Label htmlFor="budgetMax">Budget Max ($) *</Label>
                      <Input id="budgetMax" type="number" value={form.budgetMax} onChange={e => setForm(f => ({ ...f, budgetMax: e.target.value }))} placeholder="15" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="category">Kategori / Lokasi</Label>
                    <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                      <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                      <SelectContent>
                        {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="desc">Deskripsi</Label>
                    <Textarea id="desc" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detail kebutuhan produk..." rows={3} />
                  </div>
                  <Button type="submit" className="w-full btn-web3">
                    <Search className="h-4 w-4 mr-2" />
                    Ajukan Permintaan
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Request List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-semibold text-lg">Daftar Permintaan ({requests.length})</h3>
              {requests.length === 0 ? (
                <Card className="glass-card border-border/50">
                  <CardContent className="pt-6 text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Belum ada permintaan. Buat permintaan pertama Anda!</p>
                  </CardContent>
                </Card>
              ) : (
                requests.map((req, index) => {
                  const sc = statusConfig[req.status];
                  return (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="glass-card border-border/50">
                        <CardContent className="pt-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">{req.productName}</h4>
                              <p className="text-xs text-muted-foreground">{req.id} • {new Date(req.createdAt).toLocaleDateString('id-ID')}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={sc.color}>{sc.label}</Badge>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { removeRequest(req.id); toast.success("Permintaan dihapus"); }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div><span className="text-muted-foreground">Jumlah:</span> <span className="font-medium">{req.quantity} {req.unit}</span></div>
                            <div><span className="text-muted-foreground">Budget:</span> <span className="font-medium">${req.budgetMin} - ${req.budgetMax}/kg</span></div>
                            {req.category && <div><span className="text-muted-foreground">Kategori:</span> <span className="font-medium">{req.category}</span></div>}
                            <div><span className="text-muted-foreground">Status:</span> <span className="font-medium">{sc.label}</span></div>
                          </div>
                          {req.description && <p className="text-sm text-muted-foreground mt-3 border-t border-border/50 pt-3">{req.description}</p>}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </PageTransition>
      <Web3Footer />
    </div>
  );
};

export default ProductRequest;
